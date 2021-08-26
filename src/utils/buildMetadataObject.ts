import {
  GeneralTransactionMetadata,
  TransactionMetadatum,
  BigNum,
} from '@emurgo/cardano-serialization-lib-nodejs';

export const buildMetadataObj = (metadataMap: null | Record<string, string>): null | string => {
  if (metadataMap == null) return null;
  const metadataWasm = GeneralTransactionMetadata.new();
  for (const key of Object.keys(metadataMap)) {
    const keyWasm = BigNum.from_str(key);
    // the cbor inserted into SQL is not the full metadata for the transaction
    // instead, each row is a CBOR map with a single entry <transaction_metadatum_label, transaction_metadatum>
    const singletonMap = TransactionMetadatum.from_bytes(
      Buffer.from(
        // need to cutoff the \\x prefix added by SQL
        metadataMap[key].substring(2),
        'hex',
      ),
    );
    const map = singletonMap.as_map();
    const keys = map.keys();
    for (let i = 0; i < keys.len(); i++) {
      const cborKey = keys.get(i);
      const datumWasm = map.get(cborKey);
      metadataWasm.insert(keyWasm, datumWasm);
      datumWasm.free();
      cborKey.free();
    }
    keyWasm.free();
    singletonMap.free();
    map.free();
    keys.free();
  }
  const result = Buffer.from(metadataWasm.to_bytes()).toString('hex');
  metadataWasm.free();

  return result;
};
