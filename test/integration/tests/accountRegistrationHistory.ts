import { getApiUrl } from '../utils';

describe('/accountRegistrationHistory', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/account/registrationHistory');
    await page.setRequestInterception(true);

    const address = 'e10408e68eafe1a57cf99a2793787a22dbb908d7d57c9976c440cbfc68';

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

    expect(responseJson[address]).toBeArray;
    expect(responseJson[address][0]).toHaveProperty('slot');
    expect(responseJson[address][0]).toHaveProperty('txIndex');
    expect(responseJson[address][0]).toHaveProperty('certIndex');
    expect(responseJson[address][0]).toHaveProperty('certType');
    expect(responseJson[address][0].slot).toBe(4494060);
    expect(responseJson[address][0].txIndex).toBe(5);
    expect(responseJson[address][0].certIndex).toBe(0);
    expect(responseJson[address][0].certType).toBe('StakeRegistration');
  });
});
