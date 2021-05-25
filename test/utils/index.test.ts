import * as utils from '../../src/utils';

describe('utils', () => {
  test('bech32 decode', () => {
    expect(utils.bDecode('pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy')).toEqual(
      '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
    );
  });
});
