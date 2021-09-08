import { Responses } from '@blockfrost/blockfrost-js';
import { getApi } from '../utils/blockfrostAPI';
import * as Types from '../types';
import { bDecode, bEncodePool, bDecodeMultipleOwners } from '../utils/';

export const getInfo = async (pools: string[]): Promise<Types.PoolInfoGetResult[]> => {
  const api = getApi();

  const promisesBundle: {
    pool: string;
    promise: Promise<Types.PoolInfoGetPromise>;
  }[] = [];

  const result: Types.PoolInfoGetResult[] = [];

  pools.map(pool => {
    const promise = new Promise<Types.PoolInfoGet>((resolve, reject) => {
      (async () => {
        try {
          const encodedPool = bEncodePool(pool);
          const poolGeneral = await api.poolsById(encodedPool);
          const poolInfo = await api.poolMetadata(encodedPool);

          return resolve({ pool, poolInfo, poolGeneral });
        } catch (err) {
          return reject(err);
        }
      })();
    });
    promisesBundle.push({ pool, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ pool: p.pool, poolInfo: data.poolInfo, poolGeneral: data.poolGeneral });
        })
        .catch(err => {
          if (err.status_code === 404) {
            result.push({ pool: p.pool, poolInfo: null, poolGeneral: null });
            return;
          }
          throw Error(err);
        }),
    ),
  );
  return result;
};

export const getHistory = async (
  pools: Types.PoolInfoGetResult[],
): Promise<Types.PoolInfoGetHistoryExtraResult[]> => {
  const api = getApi();

  const promisesBundle: {
    pool: string;
    poolInfo: Responses['pool_metadata'] | null;
    poolGeneral: Responses['pool'] | null;
    promise: Promise<Types.PoolInfoGetHistoryPromise>;
  }[] = [];
  const result: Types.PoolInfoGetHistoryExtraResult[] = [];
  pools.map(pool => {
    if (pool.poolGeneral !== null) {
      const encodedPool = bEncodePool(pool.pool);

      const poolUpdatesOrRetirements = [
        { type: 'update', list: pool.poolGeneral.registration },
        { type: 'retirement', list: pool.poolGeneral.retirement },
      ];
      poolUpdatesOrRetirements.map(poolUpdateOrRetirement => {
        poolUpdateOrRetirement.list.map(txHash => {
          const promise = new Promise<Types.PoolInfoGetHistoryResult>((resolve, reject) => {
            (async () => {
              try {
                if (poolUpdateOrRetirement.type === 'update') {
                  const txGeneral = await api.txs(txHash);
                  const txGeneralBlock = await api.blocks(txGeneral.block);
                  const txDetail = await api.txsPoolUpdates(txHash);

                  const txsDetailsFiltered = txDetail.filter(item => item.pool_id === encodedPool);
                  const txs = txsDetailsFiltered.map(tx => {
                    const relays = tx.relays.map(relay => {
                      const bfRelay: Types.pool_relays_single = relay;
                      const YoroiRelay: Types.PoolRelay = {
                        ipv4: bfRelay.ipv4 || null,
                        ipv6: bfRelay.ipv6 || null,
                        dnsName: bfRelay.dns || null,
                        dnsSrvName: bfRelay.dns_srv || null,
                        port: bfRelay.port.toString(),
                      };
                      return YoroiRelay;
                    });
                    return {
                      epoch: txGeneralBlock.epoch || 0,
                      slot: txGeneralBlock.epoch_slot || 0,
                      tx_ordinal: txGeneral.index,
                      cert_ordinal: tx.cert_index,
                      payload: {
                        kind: 'PoolRegistration',
                        certIndex: tx.cert_index,
                        poolParams: {
                          operator: pool.pool,
                          // set default values to pool.poolGeneral.* as there's a null in openapi definition
                          // but it should never happen (as we're checking the whole poolGeneral for null values)
                          vrfKeyHash: tx.vrf_key,
                          pledge: tx.pledge,
                          cost: tx.fixed_cost,
                          margin: tx.margin_cost,
                          rewardAccount: bDecode(tx.reward_account),
                          poolOwners: bDecodeMultipleOwners(tx.owners),
                          relays: relays,
                          poolMetadata: {
                            url: tx.metadata ? tx.metadata.url || '' : '',
                            metadataHash: tx.metadata ? tx.metadata.hash || '' : '',
                          },
                        },
                      },
                    } as const;
                  });

                  return resolve({
                    poolHistory: txs,
                  });
                } else if (poolUpdateOrRetirement.type === 'retirement') {
                  const txGeneral = await api.txs(txHash);
                  const txGeneralBlock = await api.blocks(txGeneral.block);
                  const txDetail = await api.txsPoolRetires(txHash);
                  const txsDetailsFiltered = txDetail.filter(item => item.pool_id === encodedPool);
                  const txs = txsDetailsFiltered.map(
                    txDetailFiltered =>
                      ({
                        epoch: txGeneralBlock.epoch || 0,
                        slot: txGeneralBlock.epoch_slot || 0,
                        tx_ordinal: txGeneral.index,
                        cert_ordinal: txDetailFiltered.cert_index,
                        payload: {
                          kind: 'PoolRetirement',
                          certIndex: txDetailFiltered.cert_index,
                          poolKeyHash: pool.pool,
                          epoch: txDetailFiltered.retiring_epoch,
                        },
                      } as const),
                  );
                  return resolve({
                    poolHistory: txs,
                  });
                }
              } catch (err) {
                return reject(err);
              }
            })();
          });

          promisesBundle.push({
            pool: pool.pool,
            poolInfo: pool.poolInfo,
            poolGeneral: pool.poolGeneral,
            promise,
          });
        });
      });
    }
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({
            pool: p.pool,
            poolInfo: p.poolInfo,
            poolGeneral: p.poolGeneral,
            poolHistory: data.poolHistory,
          });
        })
        .catch(err => {
          if (err.status_code === 404) {
            return;
          }
          throw Error(err);
        }),
    ),
  );

  return result;
};

export const poolInfoMethod = async (pools: string[]): Promise<Types.PoolInfoYoroi> => {
  const result: Types.PoolInfoYoroi[] = [];
  try {
    const poolsWithInfo = await getInfo(pools);
    const poolsWithInfoAndHistory = await getHistory(poolsWithInfo);
    const uniquePools: Types.PoolInfoGetHistoryExtraResult[] = [];

    poolsWithInfoAndHistory.forEach(item => {
      const duplicatedObject = uniquePools.find(itemInside => itemInside.pool === item.pool);

      if (duplicatedObject) {
        duplicatedObject.poolHistory = duplicatedObject.poolHistory.concat(item.poolHistory);
      } else {
        uniquePools.push(item);
      }
    });

    uniquePools.map(item => {
      let info: Types.PoolInfoInfoYoroi = {};
      if (item.pool) {
        if (item.poolInfo !== null) {
          info = {
            name: item.poolInfo.name ? item.poolInfo.name : undefined,
            description: item.poolInfo.description ? item.poolInfo.description : undefined,
            ticker: item.poolInfo.ticker ? item.poolInfo.ticker : undefined,
            homepage: item.poolInfo.homepage ? item.poolInfo.homepage : undefined,
          };
        }

        item.poolHistory.sort(function compare(first, second) {
          return (
            first.epoch - second.epoch ||
            first.slot - second.slot ||
            first.cert_ordinal - second.cert_ordinal
          );
        });
        result.push({ [item.pool]: { info: info, history: item.poolHistory } });
      } else {
        result.push({ [item.pool]: null });
      }
    });

    // Yoroi currently doesn't return array... but let's keep the support for it and return just the first element for now
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};
