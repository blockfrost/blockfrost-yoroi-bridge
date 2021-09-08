import { getApiUrl } from '../utils';

describe('/accountRewardHistory', () => {
  it('returns', async () => {
    const apiUrl = getApiUrl('/api/account/rewardHistory');
    await page.setRequestInterception(true);

    const address = 'e1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e';

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

    let sum = 0;
    for (const epochReward of responseJson[address]) {
      if (epochReward.epoch >= 210 && epochReward.epoch <= 220) {
        sum += Number.parseInt(epochReward.reward, 10);
      }
    }
    expect(sum).toEqual(66012);

    expect(responseJson).toHaveProperty(address);
    expect(responseJson[address]).toBeArray;
  });
});
