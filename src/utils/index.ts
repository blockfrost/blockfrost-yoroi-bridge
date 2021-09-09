import { bech32 } from 'bech32';
import { network } from '../config';

export const bDecode = (input: string): string => {
  try {
    const decodedWords = bech32.decode(input, 1000);
    const payload = bech32.fromWords(decodedWords.words);
    const decoded = `${Buffer.from(payload).toString('hex')}`;
    return decoded;
  } catch (err) {
    throw new Error('Error while decoding single bech32');
  }
};

export const bDecodeMultiple = (input: string[]): string[] => {
  try {
    const decoded: string[] = [];
    input.map(item => {
      const decodedWords = bech32.decode(item, 1000);
      const payload = bech32.fromWords(decodedWords.words);
      const decodedItem = `${Buffer.from(payload).toString('hex')}`;
      decoded.push(decodedItem);
    });
    return decoded;
  } catch (err) {
    throw Error('Error while decoding multiple bech32');
  }
};

export const bDecodeMultipleOwners = (input: string[]): string[] => {
  try {
    const decoded: string[] = [];
    input.map(item => {
      const decodedWords = bech32.decode(item, 1000);
      const payload = bech32.fromWords(decodedWords.words);
      const decodedItem = `${Buffer.from(payload).toString('hex')}`;
      const shortenedItem = decodedItem.substring(2);
      decoded.push(shortenedItem);
    });
    return decoded;
  } catch (err) {
    throw new Error('Error while decoding multiple owners');
  }
};

export const bEncodePool = (input: string): string => {
  try {
    const encoded = bech32.encode(
      'pool',
      bech32.toWords(Uint8Array.from(Buffer.from(input, 'hex'))),
      1000,
    );

    return encoded;
  } catch (err) {
    throw new Error('Error while encoding pool');
  }
};

export const bEncodeMultiplePools = (input: string[]): string[] => {
  try {
    const encoded: string[] = [];
    input.map(item => {
      encoded.push(
        bech32.encode('pool', bech32.toWords(Uint8Array.from(Buffer.from(item, 'hex'))), 1000),
      );
    });
    return encoded;
  } catch (err) {
    throw new Error('Error while encoding multiple pools');
  }
};

export const bEncodeStakeAddress = (input: string): string => {
  try {
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
  } catch (err) {
    throw new Error('Error while encoding stake address');
  }
};
