import { getApiUrl } from '../utils';

describe('/accountState', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/account/state');
    await page.setRequestInterception(true);

    const address = 'e15e8600926ab1856e52bf2f2960def3bc59f7ffa5c4162a578ddd264b';

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

    expect(responseJson).toHaveProperty(address);
    expect(parseInt(responseJson[address].remainingAmount)).toBeGreaterThanOrEqual(0);
    expect(parseInt(responseJson[address].rewards)).toBeGreaterThanOrEqual(0);
    expect(parseInt(responseJson[address].withdrawals)).toBeGreaterThanOrEqual(0);
  });
});
