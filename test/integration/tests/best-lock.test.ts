import { getApiUrl } from '../utils';

describe('/bestblock', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/accountRegistrationHistory');
    const response = await page.goto(apiUrl);
    const responseJson = await response.json();
    expect(responseJson).toMatchObject({ a: 'b' });
  });
});
