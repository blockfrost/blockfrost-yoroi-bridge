import * as utils from '../../src/utils';

describe('utils', () => {
  test('get params', () => {
    expect(utils.getParams()).toEqual('a');
  });
});
