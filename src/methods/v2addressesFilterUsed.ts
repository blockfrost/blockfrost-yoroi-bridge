import { getAddresses } from '../utils/addresses';

export const v2addressesFilterUsedMethod = async (addresses: string[]): Promise<string[]> => {
  try {
    const result: string[] = [];
    const addressesResult = await getAddresses(addresses); // TODO: use addresses/address/txs count 1 page 1 to improve!

    addressesResult.map(item => {
      if (item.data === 'empty') return;
      result.push(item.address);
    });
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
