import BigNumber from 'bignumber.js';
import { getAddresses } from '../utils/addresses';

export const txsUtxoSumForAddressesMethod = async (
  addresses: string[],
): Promise<{ sum: string }> => {
  try {
    const addressesResult = await getAddresses(addresses);
    const sumBig = new BigNumber(0);
    let result = new BigNumber(0);

    addressesResult.map(item => {
      if (item.data === 'empty') return;
      const lovelace = item.data.amount.find(i => i.unit === 'lovelace');
      if (lovelace) {
        result = sumBig.plus(lovelace.quantity).plus(result);
      }
    });
    return { sum: result.toString() };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
