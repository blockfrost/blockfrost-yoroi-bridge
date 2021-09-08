import { network } from '../config';
import { Responses } from '@blockfrost/blockfrost-js';
import { getApi } from '../utils/blockfrostAPI';
import { bDecode, bDecodeMultipleOwners, bEncodeStakeAddress } from '../utils';
import { buildMetadataObj } from '../utils/buildMetadataObject';
import * as Types from '../types';

export const addressesToTxIds = async (
  input: string[],
  afterBlock?: string | undefined,
  afterTx?: string | undefined,
  untilBlock?: string | undefined,
): Promise<Responses['address_transactions_content']> => {
  const api = getApi();
  //const block = await api.blocks();
  let fromBlock: string | undefined;
  let toBlock: string | undefined;

  let afterBlockHeight;
  let afterBlockTxIndex;
  let untilBlockHeight;

  if (typeof afterBlock !== 'undefined') {
    try {
      afterBlockHeight = (await api.blocks(afterBlock)).height;
    } catch (err) {
      throw new Error('REFERENCE_BLOCK_MISMATCH');
    }

    if (typeof afterTx !== 'undefined') {
      try {
        afterBlockTxIndex = (await api.txs(afterTx)).index;
      } catch (err) {
        throw new Error('REFERENCE_TX_NOT_FOUND');
      }
    }
  }
  if (typeof untilBlock !== 'undefined') {
    try {
      untilBlockHeight = (await api.blocks(untilBlock)).height;
    } catch (err) {
      throw new Error('REFERENCE_BEST_BLOCK_MISMATCH');
    }
  }

  // Treat stake address separately
  let stakeAddresses = [];
  const stakeAddressesEncoded: string[] = [];
  const allAccountTransactions: Responses['address_transactions_content'] = [];
  // find any stake addresses e0 testnet, e1 mainnet
  if (network === 'mainnet') {
    stakeAddresses = input.filter(i => i.startsWith('e1'));
    if (stakeAddresses.length !== 0) {
      stakeAddresses.map(stakeAddress => {
        const encoded = bEncodeStakeAddress(stakeAddress);
        input.splice(input.indexOf(stakeAddress), 1);
        stakeAddressesEncoded.push(encoded);
      });
    }
  } else {
    stakeAddresses = input.filter(i => i.startsWith('e0'));

    if (stakeAddresses.length !== 0) {
      stakeAddresses.map(stakeAddress => {
        const encoded = bEncodeStakeAddress(stakeAddress);
        input.splice(input.indexOf(stakeAddress), 1);
        stakeAddressesEncoded.push(encoded);
      });
    }
  }

  const hashes: string[] = [];
  // registration, deregistration, delegation, pool registration, pool retirement, MIR (reserve and treasury),
  // https://github.com/Emurgo/yoroi-graphql-migration-backend/blob/master/src/Transactions/certificates.ts

  // (de)registrations

  if (stakeAddressesEncoded.length !== 0) {
    const promisesBundleAccountsRegistrations: Promise<
      Responses['account_registration_content']
    >[] = [];
    stakeAddressesEncoded.map(item => {
      const promise = api.accountsRegistrationsAll(item);
      promisesBundleAccountsRegistrations.push(promise);
    });

    const registrationTransactions = (
      await Promise.all(
        promisesBundleAccountsRegistrations.map(p =>
          p
            .then(data => {
              return data;
            })
            .catch(err => {
              if (err.status_code === 404) {
                return;
              }
              console.log(err);
            }),
        ),
      )
    ).flat();

    // delegations
    const promisesBundleAccountsDelegations: Promise<
      Responses['account_delegation_content']
    >[] = [];
    stakeAddressesEncoded.map(item => {
      const promise = api.accountsDelegationsAll(item);
      promisesBundleAccountsDelegations.push(promise);
    });
    const delegationTransactions = (
      await Promise.all(
        promisesBundleAccountsDelegations.map(p =>
          p
            .then(data => {
              return data;
            })
            .catch(err => {
              if (err.status_code === 404) {
                return;
              }
              console.log(err);
            }),
        ),
      )
    ).flat();

    // MIRs
    const promisesBundleAccountsMirs: Promise<Responses['account_mir_content']>[] = [];
    stakeAddressesEncoded.map(item => {
      const promise = api.accountsMirsAll(item);
      promisesBundleAccountsMirs.push(promise);
    });

    const mirsTransactions = (
      await Promise.all(
        promisesBundleAccountsMirs.map(p =>
          p
            .then(data => {
              return data;
            })
            .catch(err => {
              if (err.status_code === 404) {
                return;
              }
              console.log(err);
            }),
        ),
      )
    ).flat();

    registrationTransactions.forEach(item => {
      if (typeof item !== 'undefined') {
        hashes.push(item.tx_hash);
      }
    });
    delegationTransactions.forEach(item => {
      if (typeof item !== 'undefined') {
        hashes.push(item.tx_hash);
      }
    });
    mirsTransactions.forEach(item => {
      if (typeof item !== 'undefined') {
        hashes.push(item.tx_hash);
      }
    });

    const promisesHashesBundle: Promise<Responses['tx_content']>[] = [];
    input.map(item => {
      const promise = api.txs(item);
      promisesHashesBundle.push(promise);
    });
    const allAccountTransactionsRaw = (
      await Promise.all(
        promisesHashesBundle.map(p =>
          p
            .then(data => {
              return data;
            })
            .catch(err => {
              if (err.status_code === 404) {
                return;
              }
              console.log(err);
            }),
        ),
      )
    ).flat();
    allAccountTransactionsRaw.map(item => {
      async () => {
        if (typeof item !== 'undefined') {
          if (typeof afterBlock !== 'undefined') {
            // afterBlock is inclusive (>=)
            if (item.block_height >= Number(afterBlock)) {
              if (typeof afterTx !== 'undefined') {
                const afterBlockTxIndex = (await api.txs(afterTx)).index;
                // afterBlockTx is not inclusive (>)
                if (item.index > afterBlockTxIndex) {
                  if (typeof untilBlock !== 'undefined') {
                    const untilBlockHeight = (await api.blocks(untilBlock)).height;

                    if (untilBlockHeight === null || item.block_height <= untilBlockHeight) {
                      // all good
                    } else {
                      return;
                    }
                  }
                } else {
                  return;
                }
              }
            } else {
              return;
            }
          }

          // if the parameter is defined and tx is out of range, it won't get to this point

          const reformatedTx = {
            tx_hash: item.hash,
            tx_index: item.index,
            block_height: item.block_height,
          };

          allAccountTransactions.push(reformatedTx);
        }
      };
    });
  }

  // we need to reformat fromBlock to match our API
  if (typeof afterBlock !== 'undefined') {
    if (typeof afterTx !== 'undefined' && typeof afterBlockTxIndex !== 'undefined') {
      // +1 since afterBlockTxIndex is not inclusive (>)
      fromBlock = `${afterBlockHeight}:${afterBlockTxIndex + 1}`;
    } else {
      fromBlock = `${afterBlockHeight}`;
    }
  }

  if (typeof untilBlock !== 'undefined') {
    toBlock = `${untilBlockHeight}`;
  }

  const promisesBundle: Promise<Responses['address_transactions_content']>[] = [];
  input.map(item => {
    // get 50 transactions from each address (to order them at the end)
    const promise = api.addressesTransactions(
      item,
      { page: 1, count: 50, order: 'asc' },
      { from: fromBlock, to: toBlock },
    );
    promisesBundle.push(promise);
  });
  const allAddressTransactions = (await Promise.all(promisesBundle)).flat();

  // remove duplicates
  const uniqueAccountTransactions = allAccountTransactions.filter(
    (item, index, self) => index === self.findIndex(t => t.tx_hash === item.tx_hash),
  );

  const uniqueAddressTransactions = allAddressTransactions.filter(
    (item, index, self) => index === self.findIndex(t => t.tx_hash === item.tx_hash),
  );

  const allTransactions = [...uniqueAccountTransactions, ...uniqueAddressTransactions];

  // sort by block height and by index
  const sortedTxs = allTransactions.sort(
    (first, second) => first.block_height - second.block_height || first.tx_index - second.tx_index,
  );
  const result = sortedTxs.slice(0, 50); // first 50 transactions
  return result;
};

export const txIdsToTransactions = async (
  transactions: Responses['address_transactions_content'],
): Promise<Types.txsHistory[]> => {
  const api = getApi();

  const promisesBundle: Promise<Types.txsHistory>[] = [];
  transactions.map(item => {
    const promise = new Promise<Types.txsHistory>((resolve, reject) => {
      (async () => {
        try {
          // TODO: Improve by firing all subsequent calls concurrently
          const txData = await api.txs(item.tx_hash);

          const metadata = await api.txsMetadataCbor(item.tx_hash);
          let txMetadata = null;
          const txMetadataCbor: null | Record<string, string> = {};

          if (metadata.length > 0) {
            metadata.forEach(metadatum => {
              if (metadatum.label !== null && metadatum.cbor_metadata !== null) {
                txMetadataCbor[metadatum.label] = metadatum.cbor_metadata;
              }
            });
            txMetadata = buildMetadataObj(txMetadataCbor);
          }

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
                rewardAddress: bDecode(certificate.address),
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
                rewardAddress: bDecode(certificate.address),
              };
              certificates.push(reformattedCertificate);
            });
          }

          if (txData.pool_update_count > 0) {
            const poolUpdateCertificate = await api.txsPoolUpdates(item.tx_hash);
            poolUpdateCertificate.map(certificate => {
              const reformattedRelays = certificate.relays.map(relay => {
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

              let reformattedMetadata = null;

              if (certificate.metadata) {
                reformattedMetadata = {
                  url: certificate.metadata.url ? certificate.metadata.url : '',
                  metadataHash: certificate.metadata.hash ? certificate.metadata.hash : '',
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

          if (txData.mir_cert_count > 0) {
            const mirCertificates = await api.txsMirs(item.tx_hash);
            const aggregatedCertificates: Types.MoveInstantaneousRewardsCert[] = [];

            mirCertificates.map(certificate => {
              let potSource: 0 | 1 = 0;

              if (certificate.pot === 'reserve') {
                potSource = 0;
              } else if (certificate.pot === 'treasury') {
                potSource = 1;
              }

              //let aggregatedRewards: Types.Dictionary<string>;

              const foundAggregatedCertificate = aggregatedCertificates.find(
                i => i.certIndex === certificate.cert_index && i.pot === potSource,
              );

              if (!foundAggregatedCertificate) {
                aggregatedCertificates.push({
                  kind: 'MoveInstantaneousRewardsCert' as const,
                  certIndex: certificate.cert_index,
                  pot: potSource,
                  rewards: { [bDecode(certificate.address)]: certificate.amount },
                });
              } else {
                //aggregatedRewards.rewards[certificate.address] = certificate.amount;
                foundAggregatedCertificate.rewards = {
                  ...foundAggregatedCertificate.rewards,
                  [bDecode(certificate.address)]: certificate.amount,
                };
              }
            });

            aggregatedCertificates.map(certificatePots => {
              certificates.push(certificatePots);
            });
          }

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
              id: `${input.tx_hash}${input.output_index}`,
              index: input.output_index,
              txHash: input.tx_hash,
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
              assets: assets ? assets : [],
            };
          });

          // time conversion
          const ISOtime = new Date(blockInfo.time * 1000).toISOString();

          // sort all certificates by indexes
          const sortedCertificates = certificates.sort(
            (first, second) => first.certIndex - second.certIndex,
          );

          const result = {
            hash: item.tx_hash,
            fee: txData.fees,
            metadata: txMetadata,
            type: blockInfo.block_vrf === null ? ('byron' as const) : ('shelley' as const),
            withdrawals: withdrawals,
            certificates: sortedCertificates,
            tx_ordinal: txData.index,
            tx_state: 'Successful' as const, // always successful https://github.com/Emurgo/yoroi-graphql-migration-backend/blob/master/src/index.ts#L165
            last_update: ISOtime, // same as time
            block_num: blockInfo.height,
            block_hash: blockInfo.hash,
            time: ISOtime,
            epoch: blockInfo.epoch,
            slot: blockInfo.epoch_slot,
            inputs: inputs,
            outputs: outputs,
          };

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

export const txshistoryMethod = async (
  addresses: string[],
  from: string | undefined,
  to: string | undefined,
  tx: string | undefined,
): Promise<Types.txsHistory[]> => {
  try {
    const addressesTxs = await addressesToTxIds(addresses, from, to, tx);
    const result = await txIdsToTransactions(addressesTxs);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
