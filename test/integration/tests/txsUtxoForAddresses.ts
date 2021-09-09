import { getApiUrl } from '../utils';

describe('/api/txs/utxoForAddresses', () => {
  const apiUrl = getApiUrl('/api/txs/utxoForAddresses');

  it('returns data on addresses', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'DdzFFzCqrht4wFnWC5TJA5UUVE54JC9xZWq589iKyCrWa6hek3KKevyaXzQt6FsdunbkZGzBFQhwZi1MDpijwRoC7kj1MkEPh2Uu5Ssz',
      'DdzFFzCqrhtBBX4VvncQ6Zxn8UHawaqSB4jf9EELRBuWUT9gZTmCDWCNTVMotEdof1g26qbrDc8qcHZvtntxR4FaBN1iKxQ5ttjZSZoj',
      'DdzFFzCqrht62k6YFcieBUwxkq2CLSi4Pdvt3bd6ghq5P7fTgp8n5pRyQK45gN8A2Udyaj9mFRdK1eUoxy1QjcU5AuCix5uJB3zdBgkf',
      'Ae2tdPwUPEZ1zsFUP2eYpyRJooGpYSBzR1jZsdK6ioAqR9vUcBiwQgyeRfB',
      'DdzFFzCqrht2Hw9qp1YcqsMJfwjMXiJR46RXU8KFALErRXnjHnjwBPCP8FDjwgUQkZeGghu69YP71ZU67EDsXa5G3g8D2Kr5XZ7Jc42b',
    ];

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData: '{"addresses":' + JSON.stringify(addresses) + '}',
        headers: {
          ...interceptedRequest.headers(),
          'Content-Type': 'application/json',
        },
      };

      // Request modified... finish sending!
      interceptedRequest.continue(data);
    });

    const response = await page.goto(apiUrl);
    const responseJson = await response.json();

    expect(responseJson).toBeArray;
    page.removeAllListeners('request');
  });

  it('returns data on single address', async () => {
    await page.setRequestInterception(true);

    const address =
      'DdzFFzCqrht4wFnWC5TJA5UUVE54JC9xZWq589iKyCrWa6hek3KKevyaXzQt6FsdunbkZGzBFQhwZi1MDpijwRoC7kj1MkEPh2Uu5Ssz';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData: '{"addresses":[' + JSON.stringify(address) + ']}',
        headers: {
          ...interceptedRequest.headers(),
          'Content-Type': 'application/json',
        },
      };

      // Request modified... finish sending!
      interceptedRequest.continue(data);
    });

    const response = await page.goto(apiUrl);
    const responseJson = await response.json();

    expect(responseJson[0]).toHaveProperty('amount');
    expect(responseJson[0]).toHaveProperty('block_num');
    expect(responseJson[0]).toHaveProperty('tx_index');
    expect(responseJson[0]).toHaveProperty('tx_hash');
    expect(responseJson[0].tx_hash).toBeString;
    expect(responseJson[0].amount).toEqual('200000');
    expect(responseJson[0].block_num).toEqual(322087);
    expect(responseJson[0].tx_index).toEqual(1);

    page.removeAllListeners('request');
  });
});
