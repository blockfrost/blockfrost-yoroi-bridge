import { Responses } from '@blockfrost/blockfrost-js';
import { getApi } from '../utils/blockfrostAPI';
import * as Types from '../types';
import { bech32 } from 'bech32';

export const accountStateGet = async (
  stake_addresses: string[],
): Promise<{ stake_address: string; data: Responses['account_content'] | null }[]> => {
  const api = getApi();

  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_content']>;
  }[] = [];

  const result: {
    stake_address: string;
    data: Responses['account_content'] | null;
  }[] = [];

  stake_addresses.map(stake_address => {
    const promise = api.accounts(stake_address);
    promisesBundle.push({ stake_address, promise });
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
          if (err.status_code === 404) {
            const decodedWords = bech32.decode(p.stake_address);
            const payload = bech32.fromWords(decodedWords.words);
            const decoded = `${Buffer.from(payload).toString('hex')}`;
            result.push({ stake_address: decoded, data: null });
            return;
          }
          console.log(err.message);
          throw Error(err);
        }),
    ),
  );
  return result;
};

export const accountStateMethod = async (
  stake_addresses: string[],
): Promise<Types.AccountStateYoroi> => {
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
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
