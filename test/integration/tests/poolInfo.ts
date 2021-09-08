import { getApiUrl } from '../utils';
import { stakhanoviteHistorySuffix } from '../fixtures/poolInfo';

describe('/api/poolInfo', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/pool/info');
    await page.setRequestInterception(true);

    page.on('request', interceptedRequest => {
      const data = {
        method: 'POST',
        postData: '{"poolIds":["b62ecc8ce7e46c4443b63b91fffaeb19f869d191a7d2381087aaa768"]}',
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
    const { history } = responseJson['b62ecc8ce7e46c4443b63b91fffaeb19f869d191a7d2381087aaa768'];
    const suffix = history.slice(0, stakhanoviteHistorySuffix.length);
    expect(suffix).toMatchObject(stakhanoviteHistorySuffix);
  });
});
