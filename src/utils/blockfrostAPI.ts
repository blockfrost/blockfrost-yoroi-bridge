import { network } from '../config';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import packageJson from '../../package.json';

const api = new BlockFrostAPI({
  projectId: process.env.PROJECT_ID || '',
  userAgent: `${packageJson.name}@${packageJson.version}`,
});

const apiTestnet = new BlockFrostAPI({
  projectId: process.env.PROJECT_ID || '',
  userAgent: `${packageJson.name}@${packageJson.version}`,
  isTestnet: true,
});

const getApi = (): BlockFrostAPI => {
  if (network === 'mainnet') {
    // true = Mainnet
    return api;
  } else {
    // false = Testnet
    return apiTestnet;
  }
};

export { api, apiTestnet, getApi };
