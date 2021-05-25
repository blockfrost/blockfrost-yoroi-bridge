import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';

export const accountStateGet = async (
  stake_addresses: string[],
): Promise<
  { stake_address: string; data: Responses['account_content'] | null }[] //| 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_content']>;
  }[] = [];

  const result: {
    stake_address: string;
    data: Responses['account_content'] | null; // | 'error' | 'empty';
  }[] = [];

  stake_addresses.map(stake_address => {
    const promise = api.accounts(stake_address);
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
            result.push({ stake_address: p.stake_address, data: null });
            return;
          }
          throw Error(err);
        }),
    ),
  );
  return result;
};

export const accountStateMethod = async (stake_addresses: string[]): Promise<any> => {
  const result: Types.AccountStateYoroi = {};
  try {
    const stakeAddressesWithInfo = await accountStateGet(stake_addresses);

    stakeAddressesWithInfo.map(item => {
      if (item.data) {
        result[item.stake_address] = {
          remainingAmount: item.data.withdrawable_amount,
          rewards: item.data.rewards_sum,
          withdrawals: item.data.withdrawals_sum,
          poolOperator: null,
        };
      } else {
        result[item.stake_address] = null;
      }
    });
  } catch (err) {
    console.log(err);
  }
  return result;
};
