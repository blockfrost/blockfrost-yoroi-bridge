import { getAddresses } from '../utils/addresses';
import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import { bDecode, bDecodeMultipleOwners } from '../utils';
import * as Types from '../types';

export const addressesToTxIds = async (
  input: Types.AddressesResult,
  //untilBlock: string,
  // afterBlock: string,
  // afterTx: string,
): Promise<Responses['address_transactions_content']> => {
  //const block = await api.blocks();
  const promisesBundle: Promise<Responses['address_transactions_content']>[] = [];
  input.map(item => {
    if (item.data === 'empty') return;
    const promise = api.addressesTransactionsAll(item.address);
    promisesBundle.push(promise);
  });
  const allTransactions = (await Promise.all(promisesBundle)).flat();
  const sortedTxs = allTransactions.sort(
    (first, second) => first.block_height - second.block_height,
  );
  const result = sortedTxs.slice(0, 49); // last 50 transactions
  //const result = last50Transactions.map(item => item.tx_hash);
  // TODO: implement cursor
  return result;
};

export const txIdsToTransactions = async (
  transactions: Responses['address_transactions_content'],
): Promise<Types.txsHistory[]> => {
  const promisesBundle: Promise<Types.txsHistory>[] = [];
  transactions.map(item => {
    const promise = new Promise<Types.txsHistory>((resolve, reject) => {
      (async () => {
        try {
          // TODO: Improve by firing these 3 calls concurrently
          const txData = await api.txs(item.tx_hash);

          const withdrawals: Types.Withdrawal[] = [];

          if (txData.withdrawal_count > 0) {
            const bfWithdrawals = await api.txsWithdrawals(item.tx_hash);
            bfWithdrawals.map(withdrawal => {
              const reformattedWithdrawal = {
                address: bDecode(withdrawal.address),
                amount: withdrawal.amount,
              };
              withdrawals.push(reformattedWithdrawal);
            });
          }

          const certificates: Types.Certificate[] = [];
          if (txData.delegation_count > 0) {
            const delegationCertificate = await api.txsDelegations(item.tx_hash);
            delegationCertificate.map(certificate => {
              const reformattedCertificate = {
                kind: 'StakeDelegation' as const,
                certIndex: certificate.cert_index,
                rewardAddress: certificate.address,
                poolKeyHash: bDecode(certificate.pool_id), //pool hex (!!!NOT!!! keyhash)
              };
              certificates.push(reformattedCertificate);
            });
          }

          if (txData.stake_cert_count > 0) {
            const stakeCertificate = await api.txsStakes(item.tx_hash);
            stakeCertificate.map(certificate => {
              let regState: 'StakeRegistration' | 'StakeDeregistration' = 'StakeRegistration';

              if (!certificate.registration) {
                regState = 'StakeDeregistration';
              }

              const reformattedCertificate = {
                kind: regState,
                certIndex: certificate.cert_index,
                rewardAddress: certificate.address,
              };
              certificates.push(reformattedCertificate);
            });
          }

          if (txData.pool_update_count > 0) {
            const poolUpdateCertificate = await api.txsPoolUpdates(item.tx_hash);
            poolUpdateCertificate.map(certificate => {
              const reformattedRelays = certificate.relays.map(relay => {
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

              let reformattedMetadata = null;

              if (certificate.metadata) {
                reformattedMetadata = {
                  // should the properties be nullable? https://github.com/blockfrost/openapi/blob/master/swagger.yaml#L4294
                  url: certificate.metadata.url ? certificate.metadata.url : '', // yoroi doesn't allow null here TODO: check our openapi
                  metadataHash: certificate.metadata.hash ? certificate.metadata.hash : '', // yoroi doesn't allow null here
                };
              }

              const reformattedCertificate = {
                kind: 'PoolRegistration' as const,
                certIndex: certificate.cert_index,
                poolParams: {
                  operator: bDecode(certificate.pool_id),
                  vrfKeyHash: certificate.vrf_key,
                  pledge: certificate.pledge,
                  cost: certificate.fixed_cost,
                  margin: certificate.margin_cost,
                  rewardAccount: bDecode(certificate.reward_account),
                  poolOwners: bDecodeMultipleOwners(certificate.owners),
                  relays: reformattedRelays,
                  poolMetadata: reformattedMetadata,
                },
              };
              certificates.push(reformattedCertificate);
            });
          }

          if (txData.pool_retire_count > 0) {
            const poolRetireCertificate = await api.txsPoolRetires(item.tx_hash);
            poolRetireCertificate.map(certificate => {
              const reformattedCertificate = {
                kind: 'PoolRetirement' as const,
                certIndex: certificate.cert_index,
                epoch: certificate.retiring_epoch,
                poolKeyHash: bDecode(certificate.pool_id), //pool hex (!!!NOT!!! keyhash)
              };
              certificates.push(reformattedCertificate);
            });
          }
          // TODO: MIR!!!
          // if (txData.mir_count > 0) {
          //   const mirCertificate = await api.txsMir(item.tx_hash);
          //   poolRetireCertificate.map(certificate => {
          //     const reformattedCertificate = {
          //       kind: 'PoolRetirement' as const,
          //       certIndex: certificate.cert_index,
          //       epoch: certificate.retiring_epoch,
          //       poolKeyHash: bDecode(certificate.pool_id), //pool hex (!!!NOT!!! keyhash)
          //     };
          //     certificates.push(reformattedCertificate);
          //   });
          // }

          const blockInfo = await api.blocks(item.block_height);
          const txUtxos = await api.txsUtxos(item.tx_hash);

          const inputs = txUtxos.inputs.map(input => {
            const lovelaceBalance = input.amount.find(i => i.unit === 'lovelace');
            const assetsBalances = input.amount.filter(i => i.unit !== 'lovelace');

            const assets: Types.Asset[] = [];

            if (assetsBalances) {
              assetsBalances.map(asset => {
                const policy = asset.unit.substring(0, 56);

                let id = policy + '.';
                let name = null;
                if (asset.unit.length > 56) {
                  const hexName = asset.unit.substring(56);
                  name = hexName;
                  id = policy + '.' + hexName;
                }

                const reformattedAsset = {
                  assetId: id,
                  policyId: policy,
                  name: name,
                  amount: asset.quantity,
                };
                assets.push(reformattedAsset);
              });
            }

            return {
              address: input.address,
              amount: lovelaceBalance!.quantity,
              id: `${item.tx_hash}${txData.index}`,
              index: txData.index,
              txHash: item.tx_hash,
              assets: assets ? assets : [],
            };
          });

          const outputs = txUtxos.outputs.map(output => {
            const lovelaceBalance = output.amount.find(o => o.unit === 'lovelace');
            const assetsBalances = output.amount.filter(o => o.unit !== 'lovelace');

            const assets: Types.Asset[] = [];

            if (assetsBalances) {
              assetsBalances.map(asset => {
                const policy = asset.unit.substring(0, 56);

                let id = policy + '.';
                let name = null;
                if (asset.unit.length > 56) {
                  const hexName = asset.unit.substring(56);
                  name = hexName;
                  id = policy + '.' + hexName;
                }

                const reformattedAsset = {
                  assetId: id,
                  policyId: policy,
                  name: name,
                  amount: asset.quantity,
                };
                assets.push(reformattedAsset);
              });
            }

            return {
              address: output.address,
              amount: lovelaceBalance!.quantity,
              id: `${item.tx_hash}${txData.index}`,
              index: txData.index,
              txHash: item.tx_hash,
              assets: assets ? assets : [],
            };
          });
          const result = {
            block_num: blockInfo.height,
            block_hash: blockInfo.hash,
            tx_ordinal: txData.index,
            time: blockInfo.time.toString(),
            epoch: blockInfo.epoch,
            slot: blockInfo.epoch_slot,
            type: blockInfo.epoch || 0 >= 208 ? ('shelley' as const) : ('byron' as const), // deal with genesis block (epoch is null)
            // ^^^ TODO: testnet
            hash: item.tx_hash,
            last_update: blockInfo.time.toString(), // same as time
            tx_state: 'Successful' as const, // always successful https://github.com/Emurgo/yoroi-graphql-migration-backend/blob/master/src/index.ts#L165
            inputs: inputs,
            outputs: outputs,
            withdrawals: withdrawals,
            certificates: certificates,
          };
          console.log(result);

          return resolve(result);
        } catch (err) {
          return reject(err);
        }
      })();
    });

    promisesBundle.push(promise);
  });
  const result: Types.txsHistory[] = await Promise.all(promisesBundle);

  return result;
};

export const v2txshistoryMethod = async (addresses: string[]): Promise<Types.txsHistory[]> => {
  try {
    const addressesFiltered = await getAddresses(addresses);
    const addressesTxs = await addressesToTxIds(addressesFiltered);
    const result = await txIdsToTransactions(addressesTxs);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
