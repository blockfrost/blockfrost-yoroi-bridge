import { getApiUrl } from '../utils';

describe('/status', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/status');
    const response = await page.goto(apiUrl);
    const responseJson = await response.json();
    expect(responseJson).toMatchObject({
      isServerOk: true,
      isMaintenance: false,
      serverTime: expect.any(Number),
    });
  });
});
