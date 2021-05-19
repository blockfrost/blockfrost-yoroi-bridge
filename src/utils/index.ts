import { bech32 } from 'bech32';

export const bDecode = (input: string): string => {
  const decodedWords = bech32.decode(input);
  const payload = bech32.fromWords(decodedWords.words);
  const decoded = `${Buffer.from(payload).toString('hex')}`;
  return decoded;
};

export const bDecodeMultiple = (input: string[]): string[] => {
  const decoded: string[] = [];
  input.map(item => {
    const decodedWords = bech32.decode(item);
    const payload = bech32.fromWords(decodedWords.words);
    const decodedItem = `${Buffer.from(payload).toString('hex')}`;
    decoded.push(decodedItem);
  });
  return decoded;
};

export const bDecodeMultipleOwners = (input: string[]): string[] => {
  const decoded: string[] = [];
  input.map(item => {
    const decodedWords = bech32.decode(item);
    const payload = bech32.fromWords(decodedWords.words);
    const decodedItem = `${Buffer.from(payload).toString('hex')}`;
    const shortenedItem = decodedItem.substring(2);
    decoded.push(shortenedItem);
  });
  return decoded;
};

export const bEncodePool = (input: string): string => {
  const encoded = bech32.encode(
    'pool',
    bech32.toWords(Uint8Array.from(Buffer.from(input, 'hex'))),
    1000,
  );

  return encoded;
};

export const bEncodeMultiplePools = (input: string[]): string[] => {
  const encoded: string[] = [];
  input.map(item => {
    encoded.push(
      bech32.encode('pool', bech32.toWords(Uint8Array.from(Buffer.from(item, 'hex'))), 1000),
    );
  });
  return encoded;
};

export const removeEmpty = (obj: any): any => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v != null)
      .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v]),
  );
};
