import { getApiUrl } from '../utils';
import { resultsForSingleHistory, shelleyAddressWithCerts } from '../fixtures/txsHistory';
import { bech32 } from 'bech32';
import * as Types from '../../../src/types';

describe('/api/v2/txs/history', () => {
  const apiUrl = getApiUrl('/api/v2/txs/history');

  it('Return data', async () => {
    await page.setRequestInterception(true);
    const addresses = [
      'DdzFFzCqrhsnUbJho1ERJsuZxkevYTofBFMuQo5Uaxmb2dHUQX7TzK4C9gN5Yc5Hc4ok4o4wj1krZrgvQWGfd4BgpYFRQUQBgLzZxFi6',
      'DdzFFzCqrht33HAPd4PyqRAhmry5gsSgvZjh8dWdZPuHYchXPbP1W3Rw5A2zwgftbeU9rMu3znnpNib3oFGkmBy3LL8i8VTZhNG9qnwN',
    ];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    expect(responseJson[0]).toHaveProperty('hash');
    expect(responseJson[0]).toHaveProperty('fee');
    expect(responseJson[0]).toHaveProperty('metadata');
    expect(responseJson[0]).toHaveProperty('type');
    expect(responseJson[0]).toHaveProperty('withdrawals');
    expect(responseJson[0]).toHaveProperty('certificates');
    expect(responseJson[0]).toHaveProperty('block_num');
    expect(responseJson[0]).toHaveProperty('block_hash');
    expect(responseJson[0]).toHaveProperty('time');
    expect(responseJson[0]).toHaveProperty('last_update');
    expect(responseJson[0]).toHaveProperty('tx_state');
    expect(responseJson[0]).toHaveProperty('tx_ordinal');
    expect(responseJson[0]).toHaveProperty('epoch');
    expect(responseJson[0]).toHaveProperty('slot');
    expect(responseJson[0]).toHaveProperty('inputs');
    expect(responseJson[0]).toHaveProperty('outputs');
    expect(responseJson[0].inputs[0]).toHaveProperty('amount');
    expect(responseJson[0].inputs[0]).toHaveProperty('id');
    expect(responseJson[0].inputs[0]).toHaveProperty('index');
    expect(responseJson[0].inputs[0]).toHaveProperty('assets');
    expect(responseJson[0].inputs[0]).toHaveProperty('txHash');
    expect(responseJson[0].outputs[0]).toHaveProperty('address');
    expect(responseJson[0].outputs[0]).toHaveProperty('amount');

    expect(responseJson).toEqual(resultsForSingleHistory);

    page.removeAllListeners('request');
  });

  it('Return empty on non existing address', async () => {
    await page.setRequestInterception(true);
    const addresses = [
      'DdzFFzCqrhsfYMUNRxtQ5NNKbWVw3ZJBNcMLLZSoqmD5trHHPBDwsjonoBgw1K6e8Qi8bEMs5Y62yZfReEVSFFMncFYDUHUTMM436KjQ',
      'DdzFFzCqrht4s7speawymCPkm9waYHFSv2zwxhmFqHHQK5FDFt7fd9EBVvm64CrELzxaRGMcygh3gnBrXCtJzzodvzJqVR8VTZqW4rKJ',
    ];

    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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
    expect(responseJson).toBeArrayOfSize(0);

    page.removeAllListeners('request');
  });

  it('Throws an error for non-existing best block', async () => {
    await page.setRequestInterception(true);
    const addresses = [
      'DdzFFzCqrhsnUbJho1ERJsuZxkevYTofBFMuQo5Uaxmb2dHUQX7TzK4C9gN5Yc5Hc4ok4o4wj1krZrgvQWGfd4BgpYFRQUQBgLzZxFi6',
      'DdzFFzCqrht33HAPd4PyqRAhmry5gsSgvZjh8dWdZPuHYchXPbP1W3Rw5A2zwgftbeU9rMu3znnpNib3oFGkmBy3LL8i8VTZhNG9qnwN',
    ];
    const hashForUntilBlock = '0000000000000000000000000000000000000000000000000000000000000000';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    console.log(responseJson);

    expect(responseJson.statusCode).toEqual(500);
    expect(responseJson.message).toEqual('REFERENCE_BEST_BLOCK_MISMATCH');

    page.removeAllListeners('request');
  });

  it('Throws an error for non-existing tx', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'DdzFFzCqrhsnUbJho1ERJsuZxkevYTofBFMuQo5Uaxmb2dHUQX7TzK4C9gN5Yc5Hc4ok4o4wj1krZrgvQWGfd4BgpYFRQUQBgLzZxFi6',
      'DdzFFzCqrht33HAPd4PyqRAhmry5gsSgvZjh8dWdZPuHYchXPbP1W3Rw5A2zwgftbeU9rMu3znnpNib3oFGkmBy3LL8i8VTZhNG9qnwN',
    ];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';
    const after = {
      tx: '0000000000000000000000000000000000000000000000000000000000000000',
      block: '6575c26f4eb1533d2087e5e755ff0b606f4fc663a40f7aa558c38c389400f2f0',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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

    console.log(responseJson);

    expect(responseJson.statusCode).toEqual(500);
    expect(responseJson.message).toEqual('REFERENCE_TX_NOT_FOUND');

    page.removeAllListeners('request');
  });

  it('Throws an error for non-existing after block', async () => {
    await page.setRequestInterception(true);

    const addresses = ['Ae2tdPwUPEZHu3NZa6kCwet2msq4xrBXKHBDvogFKwMsF18Jca8JHLRBas7'];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';
    const after = {
      tx: '9f93abce0b293b01f62ce9c8b0257a3da8aef27de164a609c32c92dc0a04f58e',
      block: '0000000000000000000000000000000000000000000000000000000000000000',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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

    console.log(responseJson);

    expect(responseJson.statusCode).toEqual(500);
    expect(responseJson.message).toEqual('REFERENCE_BLOCK_MISMATCH');

    page.removeAllListeners('request');
  });

  it('Return empty array on all valid but no txs', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'DdzFFzCqrhsnUbJho1ERJsuZxkevYTofBFMuQo5Uaxmb2dHUQX7TzK4C9gN5Yc5Hc4ok4o4wj1krZrgvQWGfd4BgpYFRQUQBgLzZxFi6',
      'DdzFFzCqrht33HAPd4PyqRAhmry5gsSgvZjh8dWdZPuHYchXPbP1W3Rw5A2zwgftbeU9rMu3znnpNib3oFGkmBy3LL8i8VTZhNG9qnwN',
    ];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';
    const after = {
      tx: 'a5fb58900cbd0a6f5b77bac47fa950555dddb85f684a074b7a748f5b6e3b1aad',
      block: '6575c26f4eb1533d2087e5e755ff0b606f4fc663a40f7aa558c38c389400f2f0',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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
    expect(responseJson).toBeArrayOfSize(0);

    page.removeAllListeners('request');
  });

  it('Return array with time in ascending order', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'DdzFFzCqrht6pqNhrJwDYh8gchg1h45C2bJRTFKmQbsv1T1EX63kpWtrwYVPTAAmpt29jYoTGBZSTDJfjA3w54kCMmsjKvsnGjnAraoB',
    ];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';
    const after = {
      tx: '9b79b090c99371da500abb092637d65da2872a7540b025d02bf1240171ec5984',
      block: 'b687efdd818816cf46ffc65cccb4326c8fc0d64ff2889f808463d8a5ad7819ce',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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

    expect(responseJson).toBeArrayOfSize(2);
    expect(Date.parse(responseJson[1].time)).toBeGreaterThan(Date.parse(responseJson[0].time));

    page.removeAllListeners('request');
  });

  it('Return same array even when addresses are duplicate (test of duplicate removal)', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'DdzFFzCqrhsnUbJho1ERJsuZxkevYTofBFMuQo5Uaxmb2dHUQX7TzK4C9gN5Yc5Hc4ok4o4wj1krZrgvQWGfd4BgpYFRQUQBgLzZxFi6',
      'DdzFFzCqrht33HAPd4PyqRAhmry5gsSgvZjh8dWdZPuHYchXPbP1W3Rw5A2zwgftbeU9rMu3znnpNib3oFGkmBy3LL8i8VTZhNG9qnwN',
    ];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';
    const after = {
      tx: '9b79b090c99371da500abb092637d65da2872a7540b025d02bf1240171ec5984',
      block: 'b687efdd818816cf46ffc65cccb4326c8fc0d64ff2889f808463d8a5ad7819ce',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
        headers: {
          ...interceptedRequest.headers(),
          'Content-Type': 'application/json',
        },
      };
      // Request modified... finish sending!
      interceptedRequest.continue(data);
    });

    const response1 = await page.goto(apiUrl);
    const responseJson1 = await response1.json();

    page.removeAllListeners('request');

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses.concat(addresses)) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
        headers: {
          ...interceptedRequest.headers(),
          'Content-Type': 'application/json',
        },
      };
      // Request modified... finish sending!
      interceptedRequest.continue(data);
    });

    const response2 = await page.goto(apiUrl);
    const responseJson2 = await response2.json();

    expect(responseJson1).toEqual(responseJson2);

    page.removeAllListeners('request');
  });

  it('Return data on mid-block pagination and inclusive untilBlock - shelley', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'addr1q84shx6jr9s258r9m45ujeyde7u4z7tthkedezjm5kdr4um64gv6jqqncjd205c540fgu5450tzvu27n9lk8ulm3s99spva2ru',
    ];
    const hashForUntilBlock = '728ceadf2d949281591175a6d1641f10f2307eff80eaf59c5300dbd4a5f83554';
    const after = {
      tx: 'f07d7d5cb0126da7da9f6a067aee00fd42efae94891a42544abfd1759248019d',
      block: '728ceadf2d949281591175a6d1641f10f2307eff80eaf59c5300dbd4a5f83554',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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

    expect(responseJson).toBeArrayOfSize(1);
    expect(responseJson[0].hash).toEqual(
      '00d6d64b251514c48a9ad75940c5e7031bae5f0d002e9be7f6caf4cc1a78b57f',
    );
    expect(responseJson[0].type).toEqual('shelley');

    page.removeAllListeners('request');
  });

  it('Return data on mid-block pagination and inclusive untilBlock - byron', async () => {
    await page.setRequestInterception(true);

    const addresses = ['Ae2tdPwUPEZLs4HtbuNey7tK4hTKrwNwYtGqp7bDfCy2WdR3P6735W5Yfpe'];
    const hashForUntilBlock = '187c5137b0c2660ad8277c843ddec0deede6da5c2ba50ac8b958127c328ddbee';
    const after = {
      tx: 'aef8aa952a11b1225f1c067824f38e0c4b6d478900db6b57f6503b81fbc09427',
      block: '07d8aee8a94c6a65b0a6dac7bb43e7f8ddb7320d3c7770db8b1be4fbd685c0aa',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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

    expect(responseJson).toBeArrayOfSize(1);
    expect(responseJson[0].hash).toEqual(
      '130f9c6f3dcb0af0733757b301c877ec63d5c127373e75268e8b20c09fa645df',
    );
    expect(responseJson[0].type).toEqual('byron');

    page.removeAllListeners('request');
  });

  it('Return data shelley era', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'addr1q9ya8v4pe33nlkgftyd70nhhp407pvnjjcsddhf64sh9gegwtvyxm7r69gx9cwvtg82p87zpwmzj0kj7tjmyraze3pzqe6zxzv',
    ];
    const hashForUntilBlock = 'e99b06115fc0cd221671b686b6d9ef1c6dc047abed2c4f7d3ae528427a746f60';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    expect(responseJson).toBeArrayOfSize(1);
    expect(responseJson[0].hash).toEqual(
      '871b14fbe5abb6cacc63f922187c4f10ea9499055a972eb5d3d4e8771af643df',
    );
    expect(responseJson[0].type).toEqual('shelley');

    page.removeAllListeners('request');
  });

  it('Return limited data with untilBlock', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'DdzFFzCqrhsnUbJho1ERJsuZxkevYTofBFMuQo5Uaxmb2dHUQX7TzK4C9gN5Yc5Hc4ok4o4wj1krZrgvQWGfd4BgpYFRQUQBgLzZxFi6',
      'DdzFFzCqrht33HAPd4PyqRAhmry5gsSgvZjh8dWdZPuHYchXPbP1W3Rw5A2zwgftbeU9rMu3znnpNib3oFGkmBy3LL8i8VTZhNG9qnwN',
    ];
    const hashForUntilBlock = '4f4b3aaa45ce53a3c3f4c36907f8b4f6ae3e29c7abef567d20b521ee14d70953';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    const last = responseJson[responseJson.length - 1];

    expect(Date.parse(last.time)).toBeLessThanOrEqual(Date.parse('2020-05-01T17:12:11.000Z'));

    page.removeAllListeners('request');
  });

  it('Return data with correct order', async () => {
    await page.setRequestInterception(true);

    const addresses = ['Ae2tdPwUPEYynjShTL8D2L2GGggTH3AGtMteb7r65oLar1vzZ4JPfxob4b8'];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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
    //rewrite to TypeScript

    // const sortedList = R.sortBy((obj: any) => obj.block_num, result.data);

    // expect(result.data).toEqual(sortedList);

    // const groupedList = R.groupBy((obj: any) => obj.block_num, result.data);
    // for (const block_num in groupedList){
    //   const sortedSubList = R.sortBy((obj: any) => obj.tx_ordinal, groupedList[block_num]);
    //   expect(groupedList[block_num]).toEqual(sortedSubList);
    // }

    page.removeAllListeners('request');
  });

  it('Return data with utxos', async () => {
    await page.setRequestInterception(true);

    const addresses = ['Ae2tdPwUPEYynjShTL8D2L2GGggTH3AGtMteb7r65oLar1vzZ4JPfxob4b8'];
    const hashForUntilBlock = '5fc6a3d84cbd3a1fab3d0f1228e0e788a1ba28f682a3a2ea7b2d49ad99645a2c';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    expect(responseJson[0].outputs[0].address).toEqual(
      'DdzFFzCqrhsvprtHyEbe74H4xUohxxsahwAJgnQHjD959CrfMTb2BcugM1eAd4Y81AeDMieMjqELXShtBNj3XPUFG1aGku1NVccDMY25',
    );
    expect(responseJson[0].outputs[0].amount).toEqual('3168639578');
    expect(responseJson[0].outputs[1].address).toEqual(
      'Ae2tdPwUPEYynjShTL8D2L2GGggTH3AGtMteb7r65oLar1vzZ4JPfxob4b8',
    );
    expect(responseJson[0].outputs[1].amount).toEqual('98000000');

    page.removeAllListeners('request');
  });

  it('Return data for payment key that only occurs in input', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      bech32.encode(
        'addr_vkh',
        bech32.toWords(
          Buffer.from('211c082781577c6b8a4832d29011baab323947e59fbd6ec8995b6c5a', 'hex'),
        ),
      ),
    ];
    const hashForUntilBlock = 'f0d4b1eed671770194a223eaba3fc0cb0b6787d83c432ec5c24b83620c9b7474';
    const after = {
      tx: '79acf08126546b68d0464417af9530473b8c56c63b2a937bf6451e96e55cb96a',
      block: 'b51b1605cc27b0be3a1ab07dfcc2ceb0b0da5e8ab5d0cb944c16366edba92e83',
    };

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ',"after":' +
          JSON.stringify(after) +
          ' }',
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

    expect(responseJson).toBeArrayOfSize(1);

    page.removeAllListeners('request');
  });

  it('Return data for payment key that only occurs in output', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      bech32.encode(
        'addr_vkh',
        bech32.toWords(
          Buffer.from('85abf3eca55024aa1c22b944599b5e890ec12dfb19941229da4ba293', 'hex'),
        ),
      ),
    ];
    const hashForUntilBlock = '094ae9802b7e0a8cee97e88cc14a3029f8788d9cb9568ae32337e6ba2c0c1a5b';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    expect(responseJson).toBeArrayOfSize(1);

    page.removeAllListeners('request');
  });

  it('Return data with shelley certificates', async () => {
    await page.setRequestInterception(true);

    const addresses = [
      'addr1q9ya8v4pe33nlkgftyd70nhhp407pvnjjcsddhf64sh9gegwtvyxm7r69gx9cwvtg82p87zpwmzj0kj7tjmyraze3pzqe6zxzv',
      'addr1v8vqle5aa50ljr6pu5ndqve29luch29qmpwwhz2pk5tcggqn3q8mu',
    ];
    const hashForUntilBlock = 'd6f6cd7101ce4fa80f7d7fe78745d2ca404705f58247320bc2cef975e7574939';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    const resultsWithCerts = responseJson.filter(
      (obj: Types.TransactionFrag) => obj.certificates.length > 0,
    );

    const certs = resultsWithCerts.map((obj: Types.TransactionFrag) => obj.certificates).flat();

    const poolRegCert = certs.filter((c: Types.Certificate) => c.kind === 'PoolRegistration')[0];

    poolRegCert.poolParams.poolOwners.every((item: any) => {
      expect(typeof item).toEqual('string');
    });
    poolRegCert.poolParams.relays.every((item: any) => {
      expect(item).toHaveProperty('ipv6');
      expect(item).toHaveProperty('ipv4');
      expect(item).toHaveProperty('dnsName');
      expect(item).toHaveProperty('dnsSrvName');
      expect(item).toHaveProperty('port');
    });
    expect(poolRegCert.poolParams.poolMetadata).toHaveProperty('url');
    expect(poolRegCert.poolParams.poolMetadata).toHaveProperty('metadataHash');

    const mirCert = certs.filter(
      (c: Types.Certificate) => c.kind === 'MoveInstantaneousRewardsCert',
    )[0];

    for (const addr in mirCert.rewards) {
      expect(typeof addr).toEqual('string');
      expect(typeof mirCert.rewards[addr]).toEqual('string');
    }

    page.removeAllListeners('request');
  });

  it('Return data with address with loads of data', async () => {
    await page.setRequestInterception(true);

    const addresses = ['addr1v8vqle5aa50ljr6pu5ndqve29luch29qmpwwhz2pk5tcggqn3q8mu'];
    const hashForUntilBlock = 'd6f6cd7101ce4fa80f7d7fe78745d2ca404705f58247320bc2cef975e7574939';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

    expect(responseJson).toEqual(shelleyAddressWithCerts);

    page.removeAllListeners('request');
  });

  it('Return data with address with witnesses', async () => {
    await page.setRequestInterception(true);

    const addresses = ['e19842145a1693dfbf809963c7a605b463dce5ca6b66820341a443501e'];
    const hashForUntilBlock = 'd6f6cd7101ce4fa80f7d7fe78745d2ca404705f58247320bc2cef975e7574939';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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

  it('Return data with address with witnesses 2', async () => {
    await page.setRequestInterception(true);

    const addresses = ['stake1uxvyy9z6z6fal0uqn93u0fs9k33aeew2ddngyq6p53p4q8smzq4sz'];
    const hashForUntilBlock = 'd6f6cd7101ce4fa80f7d7fe78745d2ca404705f58247320bc2cef975e7574939';

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData:
          '{"addresses":' +
          JSON.stringify(addresses) +
          ',"untilBlock":' +
          JSON.stringify(hashForUntilBlock) +
          ' }',
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
});
