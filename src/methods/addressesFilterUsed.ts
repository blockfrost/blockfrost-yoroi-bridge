import { getAddressesBalance } from '../utils/addresses';

export const addressesFilterUsedMethod = async (addresses: string[]): Promise<string[]> => {
  try {
    const result: string[] = [];
    const addressesResult = await getAddressesBalance(addresses);
    console.log(addressesResult);
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
