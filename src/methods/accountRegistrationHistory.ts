import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';

export const getAddressesRegistrations = async (
  stake_addresses: string[],
): Promise<
  Types.GetAddressesRegistrationsResults[] //| 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_registration_content']>;
  }[] = [];

  const result: Types.GetAddressesRegistrationsResults[] = [];

  stake_addresses.map(stake_address => {
    const promise = api.accountsRegistrations(stake_address, undefined, undefined, 'desc'); // TODO: this currently returns last 100
    promisesBundle.push({ stake_address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ stake_address: p.stake_address, data });
        })
        .catch(err => {
          if (err.status === 404) {
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
  const promisesBundle: Types.GetRegistrationsTxsDetailsPromises[] = [];
  const result: Types.GetRegistrationsTxsDetailsResults[] = [];

  stakeAddressesWithRegistrations.map(stakeAddressWithRegistrations => {
    const stakeAddressWithRegistrationsData = stakeAddressWithRegistrations.data;
    // if (
    //   stakeAddressWithRegistrationsData === 'error' ||
    //   stakeAddressWithRegistrationsData === 'empty'
    // )
    //   return;
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
          result.push({ stake_address: p.stake_address, data });
        })
        .catch(err => {
          console.log(err);
          throw Error(err);
        }),
    ),
  );

  return result;
};

export const accountRegistrationHistoryMethod = async (stake_addresses: string[]): Promise<any> => {
  const result: Types.AccountRegistrationHistoryYoroi = {};
  try {
    const stakeAddressesWithRegistrations = await getAddressesRegistrations(stake_addresses);

    const details = await getRegistrationsTxsDetails(stakeAddressesWithRegistrations);

    details.map(item => {
      result[item.stake_address] = item.data;
    });
  } catch (err) {
    console.log(err);
  }
  return result;
};
