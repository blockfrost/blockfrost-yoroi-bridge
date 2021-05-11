import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';

export const accountRegistrationHistoryGetAddressesRegistrations = async (
  stake_addresses: string[],
): Promise<
  { stake_address: string; data: Responses['account_registration_content'] }[] //| 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_registration_content']>;
  }[] = [];

  const result: {
    stake_address: string;
    data: Responses['account_registration_content']; // | 'error' | 'empty';
  }[] = [];

  stake_addresses.map(stake_address => {
    const promise = api.accountsRegistrations(stake_address, undefined, undefined, 'desc'); // FIX: this currently returns last 100
    promisesBundle.push({ stake_address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ stake_address: p.stake_address, data });
        })
        .catch(err => {
          console.log('je to vocad', err.status);
          if (err.status === 404) {
            return;
          }
          throw Error(err);
        }),
    ),
  );
  return result;
};

export const accountRegistrationHistoryGetRgistrationsTxsDetails = async (
  stakeAddressesWithRegistrations: {
    stake_address: string;
    data: Responses['account_registration_content'];
  }[],
): Promise<
  {
    stake_address: string;
    data: Types.accountRegistrationHistoryResult;
  }[]
> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Types.accountRegistrationHistoryResult>;
  }[] = [];

  const result: {
    stake_address: string;
    data: Types.accountRegistrationHistoryResult;
  }[] = [];

  stakeAddressesWithRegistrations.map(stakeAddressWithRegistrations => {
    const stakeAddressWithRegistrationsData = stakeAddressWithRegistrations.data;
    // if (
    //   stakeAddressWithRegistrationsData === 'error' ||
    //   stakeAddressWithRegistrationsData === 'empty'
    // )
    //   return;
    stakeAddressWithRegistrationsData.map(registrationTx => {
      const promise = new Promise<Types.accountRegistrationHistoryResult>((resolve, reject) => {
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

            const result = {
              slot: txDetails.slot,
              txIndex: txDetails.index,
              certIndex: txRegDetailsAccount.cert_index,
              certType: txRegDetailsAccount.registration
                ? 'StakeRegistration'
                : 'StakeDeregistration',
            };
            return resolve(result);
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
  const result: Types.accountRegistrationHistoryYoroi[] = [];
  try {
    const stakeAddressesWithRegistrations = await accountRegistrationHistoryGetAddressesRegistrations(
      stake_addresses,
    );

    const details = await accountRegistrationHistoryGetRgistrationsTxsDetails(
      stakeAddressesWithRegistrations,
    );

    details.map(item => {
      result.push(item.stake_address: item.data);
    });
    // });
  } catch (err) {
    console.log(err);
  }
  return result;
};
