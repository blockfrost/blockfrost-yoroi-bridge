import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const api = new BlockFrostAPI({
  projectId: 'v4yhZTgZRjJJbLAPMOmMGtZFg3MGIWiT', //process.env.PROJECT_ID,
});

export { api };
