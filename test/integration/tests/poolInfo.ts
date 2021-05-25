import { getApiUrl } from '../utils';

describe('/poolInfo', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/pool/info');
    const response = await page.goto(apiUrl);
    const responseJson = await response.json();
    expect(responseJson).toMatchObject({ a: 'b' });
  });
});
