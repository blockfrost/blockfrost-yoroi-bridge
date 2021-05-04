import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';

export const txsUtxoForAddressesGetUtxos = async (
  addresses: string[],
): Promise<{ address: string; data: Responses['address_utxo_content'] | 'error' | 'empty' }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_utxo_content']>;
  }[] = [];

  const result: {
    address: string;
    data: Responses['address_utxo_content'] | 'error' | 'empty';
  }[] = [];

  addresses.map(address => {
    const promise = api.addressesUtxos(address);
    promisesBundle.push({ address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(() => {
          throw Error('a');
        }),
    ),
  );
  return result;
};

export const txsUtxoForAddressesGetUtxosDetails = async (
  addressesWithUtxos: {
    address: string;
    data: Responses['address_utxo_content'] | 'error' | 'empty';
  }[],
): Promise<
  {
    address: string;
    utxos: Types.address_utxo_content_single;
    block: Responses['block_content'];
  }[]
> => {
  const promisesBundle: {
    address: string;
    utxo: Types.address_utxo_content_single;
    promise: Promise<Responses['block_content']>;
  }[] = [];

  const result: {
    address: string;
    utxos: Types.address_utxo_content_single;
    block: Responses['block_content'];
  }[] = [];

  addressesWithUtxos.map(addressWithUtxo => {
    const addressWithUtxoData = addressWithUtxo.data;
    if (addressWithUtxoData === 'error' || addressWithUtxoData === 'empty') return;
    addressWithUtxoData.map(utxo => {
      const promise = api.blocks(utxo.block);
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

export const txsUtxoForAddresses = async (
  addresses: string[],
): Promise<Types.txsUtxoForAddressesResult[]> => {
  const result: Types.txsUtxoForAddressesResult[] = [];
  try {
    //const result = [];
    const addressesWithUtxos = await txsUtxoForAddressesGetUtxos(addresses);
    const details = await txsUtxoForAddressesGetUtxosDetails(addressesWithUtxos);

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
