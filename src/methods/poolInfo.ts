import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';
import { bDecode, bDecodeMultipleOwners } from '../utils/';

export const getInfo = async (
  pools: string[],
): Promise<
  Types.PoolInfoGetResult[] //| 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    pool: string;
    promise: Promise<Types.PoolInfoGetPromise>;
  }[] = [];

  const result: Types.PoolInfoGetResult[] = []; // | 'error' | 'empty';= [];

  pools.map(pool => {
    const promise = new Promise<Types.PoolInfoGet>((resolve, reject) => {
      (async () => {
        try {
          const poolGeneral = await api.poolsById(pool);
          const poolInfo = await api.poolMetadata(pool);

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
          if (err.status === 404) {
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
): Promise<
  Types.PoolInfoGetHistoryExtraResult[] //| 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    pool: string;
    poolInfo: Responses['pool_metadata'] | null;
    poolGeneral: Responses['pool'] | null;
    promise: Promise<Types.PoolInfoGetHistoryPromise>;
  }[] = [];

  const result: Types.PoolInfoGetHistoryExtraResult[] = [];
  pools.map(pool => {
    if (pool.poolGeneral !== null) {
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
                  const txsDetailsFiltered = txDetail.filter(
                    item => bDecode(item.pool_id) !== pool.pool,
                  );

                  const txs = txsDetailsFiltered.map(tx => {
                    const relays = tx.relays.map(relay => {
                      const bfRelay: Types.pool_relays_single = relay;
                      //const YoroiRelay: Types.PoolRelay = removeEmpty(bfRelay);
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
                          operator: bDecode(pool.pool),
                          vrfKeyHash: pool.poolGeneral ? pool.poolGeneral.vrf_key : '',
                          pledge: pool.poolGeneral ? pool.poolGeneral.declared_pledge : '0',
                          cost: pool.poolGeneral ? pool.poolGeneral.fixed_cost : '0',
                          margin: pool.poolGeneral ? pool.poolGeneral.margin_cost : 0,
                          rewardAccount: pool.poolGeneral
                            ? bDecode(pool.poolGeneral.reward_account)
                            : '',
                          poolOwners: pool.poolGeneral
                            ? bDecodeMultipleOwners(pool.poolGeneral.owners)
                            : [],
                          relays: relays,
                          poolMetadata: {
                            url: tx.metadata ? tx.metadata.url || '' : '',
                            metadataHash: tx.metadata ? tx.metadata.hash || '' : '',
                          },
                        },
                      },
                    } as const; // see `v2/txs/history`}
                  });

                  return resolve({
                    poolHistory: txs,
                  });
                } else if (poolUpdateOrRetirement.type === 'retirement') {
                  const txGeneral = await api.txs(txHash);
                  const txGeneralBlock = await api.blocks(txGeneral.block);
                  const txDetail = await api.txsPoolRetires(txHash);
                  const txsDetailsFiltered = txDetail.filter(
                    item => bDecode(item.pool_id) !== pool.pool,
                  );
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
                          poolKeyHash: bDecode(pool.pool),
                          epoch: txDetailFiltered.retiring_epoch,
                        }, // see `v2/txs/history`}
                      } as const),
                  );
                  return resolve({
                    poolHistory: txs,
                  });
                }

                // export interface PoolRegistration {
                //   kind: 'PoolRegistration';
                //   certIndex: number;
                //   poolParams: PoolParams;
                // }
                // export interface PoolRetirement {
                //   kind: 'PoolRetirement';
                //   certIndex: number;
                //   poolKeyHash: string;
                //   epoch: number;
                // }
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
          // if (err.status === 404) {
          //   //TODO: ?
          //   throw Error(err);
          //   return;
          // }
          throw Error(err);
        }),
    ),
  );

  return result;
};

// export const poolInfoHistoryGet = async (
//   pools: {
//     pool: string;
//     data: Responses['pool_metadata'] | null; // | 'error' | 'empty';
//   }[],
// ): Promise<
//   {
//     pool: string;
//     dataInfo: Responses['pool_metadata'] | null;
//     dataHistory: Responses['pool_history'] | null;
//   }[] //| 'error' | 'empty' }[]
// > => {
//   const promisesBundle: {
//     pool: string;
//     dataInfo: Responses['pool_metadata'] | null;
//     promise: Promise<Responses['pool_history']>;
//   }[] = [];

//   const result: {
//     pool: string;
//     dataInfo: Responses['pool_metadata'] | null;
//     dataHistory: Responses['pool_history'] | null; // | 'error' | 'empty';
//   }[] = [];

//   pools.map(pool => {
//     const promise = api.poolsByIdHistory(pool.pool);
//     promisesBundle.push({ pool: pool.pool, dataInfo: pool.data, promise });
//   });

//   await Promise.all(
//     promisesBundle.map(p =>
//       p.promise
//         .then(data => {
//           result.push({ pool: p.pool, dataInfo: p.dataInfo, dataHistory: data });
//         })
//         .catch(err => {
//           if (err.status === 404) {
//             result.push({ pool: p.pool, dataInfo: p.dataInfo, dataHistory: null });
//             return;
//           }
//           throw Error(err);
//         }),
//     ),
//   );
//   return result;
// };

export const poolInfoMethod = async (pools: string[]): Promise<any> => {
  //const result: Types.PoolInfoYoroi = {};
  try {
    const poolsWithInfo = await getInfo(pools);
    console.log('tuk');
    const poolsWithInfoAndHistory = await getHistory(poolsWithInfo);
    console.log('tuktoje');
    //result = poolsWithInfoAndHistory;
    console.log('prazdne pole', poolsWithInfoAndHistory);
    // TODO: RESULT
    // poolsWithInfoAndHistory.map(item => {
    //   if (item.dataInfo) {
    //     const historyReassembled: Types.PoolInfoHistoryYoroi[] = [];
    //     if (item.dataHistory !== null) {
    //       item.dataHistory.map(itemHistory => {
    //         itemHistory.epoch;
    //         itemHistory;
    //         itemHistory;
    //         number;
    //         Certificate; // see `v2/txs/history`
    //       });
    //     }
    //     if (item.dataInfo !== null) {
    //       // if there's no smash data, it doesn't matter we should return undefined?
    //       result[item.pool] = {
    //         info: {
    //           name: item.dataInfo.name,
    //           description: item.dataInfo.description,
    //           ticker: item.dataInfo.ticker,
    //           homepage: item.dataInfo.homepage,
    //           extended: item.dataInfo.url,
    //         },
    //         history: historyReassembled,
    //       };
    //     }
    //   } else {
    //     result[item.pool] = null;
    //   }
    // });
    return poolsWithInfoAndHistory;
  } catch (err) {
    console.log(err);
  }
};
