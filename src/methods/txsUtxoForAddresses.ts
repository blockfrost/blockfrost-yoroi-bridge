import { Responses } from '@blockfrost/blockfrost-js';
import { getApi } from '../utils/blockfrostAPI';
import * as Types from '../types';

export const txsUtxoForAddressesGetUtxos = async (
  addresses: string[],
): Promise<{ address: string; data: Responses['address_utxo_content'] }[]> => {
  const api = getApi();

  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_utxo_content']>;
  }[] = [];

  const result: {
    address: string;
    data: Responses['address_utxo_content'];
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
    data: Responses['address_utxo_content'];
  }[],
): Promise<
  {
    address: string;
    utxos: Types.address_utxo_content_single;
    block: Responses['block_content'];
  }[]
> => {
  const api = getApi();

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
          throw Error(err);
        }),
    ),
  );
  return result;
};

export const txsUtxoForAddressesMethod = async (
  addresses: string[],
): Promise<Types.txsUtxoForAddressesResult[]> => {
  const result: Types.txsUtxoForAddressesResult[] = [];
  try {
    //const result = [];
    const addressesWithUtxos = await txsUtxoForAddressesGetUtxos(addresses);
    const details = await txsUtxoForAddressesGetUtxosDetails(addressesWithUtxos);

    details.map(item => {
      const lovelaceBalance = item.utxos.amount.find(b => b.unit === 'lovelace');
      const assetsBalances = item.utxos.amount.filter(b => b.unit !== 'lovelace');

      const reformattedAssets: Types.Asset[] = [];
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
          reformattedAssets.push(reformattedAsset);
        });
      }

      result.push({
        utxo_id: `${item.utxos.tx_hash}` + ':' + `${item.utxos.tx_index}`, // concat tx_hash and tx_index
        tx_hash: item.utxos.tx_hash,
        tx_index: item.utxos.tx_index,
        block_num: item.block.height, // NOTE: not slot_no
        receiver: item.address,
        amount: lovelaceBalance ? lovelaceBalance.quantity : '0',
        assets: reformattedAssets,
      });
    });
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
