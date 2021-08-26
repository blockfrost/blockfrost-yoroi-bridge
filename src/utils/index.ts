import { bech32 } from 'bech32';
import { network } from '../config';

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

export const bEncodeStakeAddress = (input: string): string => {
  let prefix = '';
  if (network === 'mainnet') {
    prefix = 'stake';
  } else {
    prefix = 'stake_test';
  }

  const encoded = bech32.encode(
    prefix,
    bech32.toWords(Uint8Array.from(Buffer.from(input, 'hex'))),
    1000,
  );

  return encoded;
};
