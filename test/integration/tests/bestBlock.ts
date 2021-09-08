import { getApiUrl } from '../utils';

describe('/bestBlock', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/v2/bestblock');
    const response = await page.goto(apiUrl);
    const responseJson = await response.json();
    expect(responseJson).toMatchObject({
      height: expect.any(Number),
      hash: expect.any(String),
      slot: expect.any(Number),
      epoch: expect.any(Number),
    });
  });
});
