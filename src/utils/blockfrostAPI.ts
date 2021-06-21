import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import packageJson from '../../package.json';

const api = new BlockFrostAPI({
  projectId: 'v4yhZTgZRjJJbLAPMOmMGtZFg3MGIWiT', //process.env.PROJECT_ID,
  userAgent: `${packageJson.name}@${packageJson.version}`,
});

export { api };
