import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';

export const accountRegistrationHistoryGetAddressesRegistrations = async (
  stake_addresses: string[],
): Promise<
  { stake_address: string; data: Responses['account_registration_content'] | 'error' | 'empty' }[]
> => {
  const promisesBundle: {
    stake_address: string;
    promise: Promise<Responses['account_registration_content']>;
  }[] = [];

  const result: {
    stake_address: string;
    data: Responses['account_registration_content'] | 'error' | 'empty';
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
        .catch(() => {
          throw Error('a');
        }),
    ),
  );
  return result;
};

export const accountRegistrationHistoryGetRgistrationsTxsDetails = async (
  stakeAddressesWithRegistrations: {
    stake_address: string;
    data: Responses['account_registration_content'] | 'error' | 'empty';
  }[],
): Promise<
  {
    stake_address: string;
    registrationTxs: Types.account_registration_content_single;
    block: Responses['block_content'];
  }[]
> => {
  const promisesBundle: {
    stake_address: string;
    registrationTxs: Types.address_utxo_content_single;
    promise: Promise<Responses['block_content']>;
  }[] = [];

  const result: {
    stake_address: string;
    registrationTxs: Types.address_utxo_content_single;
    block: Responses['block_content'];
  }[] = [];

  stakeAddressesWithRegistrations.map(stakeAddressWithRegistrations => {
    const stakeAddressWithRegistrationsData = stakeAddressWithRegistrations.data;
    if (
      stakeAddressWithRegistrationsData === 'error' ||
      stakeAddressWithRegistrationsData === 'empty'
    )
      return;
    stakeAddressWithRegistrationsData.map(registrationTx => {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const txDetails = await api.txs(registrationTx.tx_hash);
          const txRegDetails = await api.txsStakes(registrationTx.tx_hash);
          const result = {};
          resolve(result);
        } catch {
          reject();
        }
      });

      // const promise = api.txs(registrationTx.tx_hash);
      // const promise2 = api.txsStakes(registrationTx.tx_hash);

      promisesBundle.push({
        address: addressWithUtxo.address,
        utxo: utxo,
        promise,
      });
    });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(block => {
          result.push({ address: p.address, utxos: p.utxo, block });
        })
        .catch(err => {
          console.log(err);
          throw Error('a');
        }),
    ),
  );
  return result;
};

export const accountRegistrationHistory = async (
  stake_addresses: string[],
): Promise<Types.accountRegistrationHistoryResult[]> => {
  const result: Types.accountRegistrationHistoryResult[] = [];
  try {
    //const result = [];
    const stakeAddressesWithRegistrations = await accountRegistrationHistoryGetAddressesRegistrations(
      stake_addresses,
    );
    const details = await accountRegistrationHistoryGetRgistrationsTxsDetails(
      stakeAddressesWithRegistrations,
    );

    details.map(item => {
      const lovelace = item.utxos.amount[0].quantity; // first item = Lovelace
      item.utxos.amount.shift(); // remove Lovelace from array to get only assets

      result.push({
        utxo_id: `${item.utxos.tx_hash}` + `${item.utxos.tx_index}`, // concat tx_hash and tx_index
        tx_hash: item.utxos.tx_hash,
        tx_index: item.utxos.tx_index,
        block_num: item.block.height, // NOTE: not slot_no
        receiver: item.address,
        amount: lovelace,
        assets: item.utxos.amount,
      });
    });
  } catch (err) {
    console.log(err);
  }
  return result;
};
