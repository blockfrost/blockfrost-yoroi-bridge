import { Responses } from '@blockfrost/blockfrost-js';
import { getApi } from './blockfrostAPI';

export const getAddresses = async (
  addresses: string[],
): Promise<{ address: string; data: Responses['address_transactions_content'] | 'empty' }[]> => {
  const api = getApi();

  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_transactions_content'] | 'empty'>;
  }[] = [];

  addresses.map(address => {
    // using addresses/address/txs count 1 page 1 of api.addresses(address) is much faster
    const promise = api.addressesTransactions(address, { page: 1, count: 1, order: 'asc' });
    promisesBundle.push({ address, promise });
  });

  const result: {
    address: string;
    data: Responses['address_transactions_content'] | 'empty';
  }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          if (data.length > 0) {
            result.push({ address: p.address, data });
          } else {
            result.push({ address: p.address, data: 'empty' });
          }
        })
        .catch(err => {
          if (err.status_code === 404) {
            result.push({ address: p.address, data: 'empty' });
            return;
          } else {
            console.log('add', p.address, err);
            // CATCH 500 or other errors if necessary
            result.push({ address: p.address, data: 'empty' });
            return;
          }
        }),
    ),
  );
  return result;
};

export const getAddressesBalance = async (
  addresses: string[],
): Promise<{ address: string; data: Responses['address_content'] | 'empty' }[]> => {
  const api = getApi();

  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_content'] | 'empty'>;
  }[] = [];

  addresses.map(address => {
    // using addresses/address/txs count 1 page 1 of api.addresses(address) is faster but we can't use that here as we need the balance
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
          if (err.status_code === 404) {
            result.push({ address: p.address, data: 'empty' });
            return;
          } else {
            console.log('add', p.address, err);
            // CATCH 500 or other errors if necessary
            result.push({ address: p.address, data: 'empty' });
            return;
          }
        }),
    ),
  );
  return result;
};
