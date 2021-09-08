import { Responses } from '@blockfrost/blockfrost-js';
import { getApi } from '../utils/blockfrostAPI';
import * as Types from '../types';
import { bech32 } from 'bech32';

export const getAddressesRegistrations = async (
  stake_addresses: string[],
): Promise<Types.GetAddressesRegistrationsResults[]> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_registration_content']>;
  }[] = [];
  const api = getApi();
  const result: Types.GetAddressesRegistrationsResults[] = [];

  stake_addresses.map(stake_address => {
    const promise = api.accountsRegistrationsAll(stake_address, { order: 'desc' });
    promisesBundle.push({ stake_address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ stake_address: p.stake_address, data });
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

export const getRegistrationsTxsDetails = async (
  stakeAddressesWithRegistrations: Types.GetAddressesRegistrationsResults[],
): Promise<Types.GetRegistrationsTxsDetailsResults[]> => {
  const api = getApi();

  const promisesBundle: Types.GetRegistrationsTxsDetailsPromises[] = [];
  const result: Types.GetRegistrationsTxsDetailsResults[] = [];

  stakeAddressesWithRegistrations.map(stakeAddressWithRegistrations => {
    const stakeAddressWithRegistrationsData = stakeAddressWithRegistrations.data;

    stakeAddressWithRegistrationsData.map(registrationTx => {
      const promise = new Promise<Types.AccountRegistrationHistoryResult>((resolve, reject) => {
        (async () => {
          try {
            const txDetails = await api.txs(registrationTx.tx_hash);
            const txRegDetails = await api.txsStakes(registrationTx.tx_hash);

            const txRegDetailsAccountSorted = txRegDetails.sort((a, b) => {
              return a.cert_index - b.cert_index;
            });
            const txRegDetailsAccount = txRegDetailsAccountSorted.find(
              a => a.address === stakeAddressWithRegistrations.stake_address,
            );

            if (typeof txRegDetailsAccount === 'undefined') {
              return reject();
            }

            const singleResult: Types.AccountRegistrationHistoryResult = {
              slot: txDetails.slot,
              txIndex: txDetails.index,
              certIndex: txRegDetailsAccount.cert_index,
              certType: txRegDetailsAccount.registration
                ? 'StakeRegistration'
                : 'StakeDeregistration',
            };
            return resolve(singleResult);
          } catch (err) {
            return reject(err);
          }
        })();
      });
      promisesBundle.push({
        stake_address: stakeAddressWithRegistrations.stake_address,
        promise,
      });
    });
  });
  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          const decodedWords = bech32.decode(p.stake_address);
          const payload = bech32.fromWords(decodedWords.words);
          const decoded = `${Buffer.from(payload).toString('hex')}`;
          result.push({ stake_address: decoded, data });
        })
        .catch(err => {
          console.log(err);
          throw Error(err);
        }),
    ),
  );

  return result;
};

export const accountRegistrationHistoryMethod = async (
  stake_addresses: string[],
): Promise<Types.AccountRegistrationHistoryYoroi> => {
  const result: Types.AccountRegistrationHistoryYoroi = {};
  try {
    const stakeAddressesWithRegistrations = await getAddressesRegistrations(stake_addresses);

    const details = await getRegistrationsTxsDetails(stakeAddressesWithRegistrations);

    details.map(item => {
      if (typeof result[item.stake_address] === 'undefined') {
        result[item.stake_address] = [];
      }
      result[item.stake_address].push(item.data);
    });
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
