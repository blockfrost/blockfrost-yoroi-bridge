import { getApiUrl } from '../utils';

describe('/importerHealthCheck', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/v2/importerhealthcheck');
    const response = await page.goto(apiUrl);
    const responseJson = await response.json();
    expect(responseJson).toMatchObject({ code: 200, message: 'Importer is OK' });
  });
});
