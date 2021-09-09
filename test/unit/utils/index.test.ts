import * as utils from '../../../src/utils';

describe('utils', () => {
  test('test bDecode - good data', () => {
    expect(
      utils.bDecode(
        'addr1q8qdys75k3te9qw28uth6jc9m52nkcy9e8g623fk9qrtmkpfcl5yy6aute2x0wew5fn96u8d2z7csdkts9l8xep3makqkg9lrf',
      ),
    ).toEqual(
      '01c0d243d4b4579281ca3f177d4b05dd153b6085c9d1a545362806bdd829c7e8426bbc5e5467bb2ea2665d70ed50bd8836cb817e736431df6c',
    );

    expect(utils.bDecode('addr_vkh1t3seuxfyq7ewjuhsfuxa5lzj42qp84z7u7axn4tsg89dqjlumvf')).toEqual(
      '5c619e192407b2e972f04f0dda7c52aa8013d45ee7ba69d57041cad0',
    );

    expect(utils.bDecode('pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy')).toEqual(
      '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
    );
  });

  test('test bDecodeMultiple - good data', () => {
    expect(
      utils.bDecodeMultiple([
        'addr1q8qdys75k3te9qw28uth6jc9m52nkcy9e8g623fk9qrtmkpfcl5yy6aute2x0wew5fn96u8d2z7csdkts9l8xep3makqkg9lrf',
        'addr_vkh1t3seuxfyq7ewjuhsfuxa5lzj42qp84z7u7axn4tsg89dqjlumvf',
        'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy',
      ]),
    ).toEqual([
      '01c0d243d4b4579281ca3f177d4b05dd153b6085c9d1a545362806bdd829c7e8426bbc5e5467bb2ea2665d70ed50bd8836cb817e736431df6c',
      '5c619e192407b2e972f04f0dda7c52aa8013d45ee7ba69d57041cad0',
      '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
    ]);
  });

  test('test bDecodeMultipleOwners - good data', () => {
    expect(
      utils.bDecodeMultipleOwners([
        'stake1uylqfhwe6z3m8qlltm3wsycxpveh453z3w63h2mdcmvy87szt69m6',
        'stake1ux69nctlngdhx99a6w8hrtexu89p9prqk8vmseg9qmmquyqhuns53',
      ]),
    ).toEqual([
      '3e04ddd9d0a3b383ff5ee2e813060b337ad2228bb51bab6dc6d843fa',
      'b459e17f9a1b7314bdd38f71af26e1ca128460b1d9b8650506f60e10',
    ]);
  });

  test('test bEncodePool - good data', () => {
    expect(utils.bEncodePool('0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735')).toEqual(
      'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy',
    );
  });

  test('test bEncodeStakeAddress - good data', () => {
    expect(
      utils.bEncodeStakeAddress('e14f39feccb595162d892abd1e03d80de8e76b8a2015139430e032b2be'),
    ).toEqual('stake1u98nnlkvkk23vtvf9273uq7cph5ww6u2yq2389psuqet90sv4xv9v');
  });

  test('test bEncodeMultiplePools - good data', () => {
    expect(
      utils.bEncodeMultiplePools([
        '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
        'b62ecc8ce7e46c4443b63b91fffaeb19f869d191a7d2381087aaa768',
      ]),
    ).toEqual([
      'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy',
      'pool1kchver88u3kygsak8wgll7htr8uxn5v35lfrsyy842nkscrzyvj',
    ]);
  });

  test('test encoding and decoding utils - throwing errors', () => {
    expect(() => {
      utils.bDecode('stonks');
    }).toThrowError('Error while decoding single bech32');

    expect(() => {
      utils.bDecodeMultiple(['stonks1', 'stonks2']);
    }).toThrowError('Error while decoding multiple bech32');

    expect(() => {
      utils.bDecodeMultipleOwners(['stonks1', 'stonks2']);
    }).toThrowError('Error while decoding multiple owners');
  });
});
