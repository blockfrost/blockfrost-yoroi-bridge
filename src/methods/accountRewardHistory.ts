import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';
import { bech32 } from 'bech32';

export const accountRewardHistoryGet = async (
  stake_addresses: string[],
): Promise<
  { stake_address: string; data: Responses['account_reward_content'] }[] // | null | 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_reward_content']>;
  }[] = [];

  const result: {
    stake_address: string;
    data: Responses['account_reward_content']; // | null | 'error' | 'empty';
  }[] = [];

  stake_addresses.map(stake_address => {
    const promise = api.accountsRewards(stake_address);
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
            //result.push({ stake_address: p.stake_address, data: null });
            return;
          }
          throw Error(err);
        }),
    ),
  );
  return result;
};

export const accountRewardHistoryMethod = async (stake_addresses: string[]): Promise<any> => {
  const result: Types.AccountRewardHistoryYoroi = {};
  try {
    const stakeAddressesWithInfo = await accountRewardHistoryGet(stake_addresses);

    stakeAddressesWithInfo.map(account => {
      if (account.data) {
        const reassembledData: Types.AccountRewardHistoryEpochContentYoroi[] = [];

        account.data.map(epoch => {
          const decodedWords = bech32.decode(epoch.pool_id);
          const payload = bech32.fromWords(decodedWords.words);
          const decoded = `${Buffer.from(payload).toString('hex')}`;
          reassembledData.push({
            epoch: epoch.epoch,
            reward: epoch.amount,
            poolHash: decoded,
          });
        });

        result[account.stake_address] = reassembledData;
      } else {
        result[account.stake_address] = [];
      }
    });
  } catch (err) {
    console.log(err);
  }
  return result;
};
