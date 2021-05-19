import { Responses } from '@blockfrost/blockfrost-js';
import { api } from './blockfrostAPI';

export const getAddresses = async (
  addresses: string[],
): Promise<{ address: string; data: Responses['address_content'] | 'empty' }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_content'] | 'empty'>;
  }[] = [];

  addresses.map(address => {
    const promise = api.addresses(address);
    promisesBundle.push({ address, promise });
  });

  const result: {
    address: string;
    data: Responses['address_content'] | 'empty';
  }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(err => {
          if (err.status === 404) {
            result.push({ address: p.address, data: 'empty' });
            return;
          }
          console.log(err);
          throw Error(err);
        }),
    ),
  );
  return result;
};
