import { Responses } from '@blockfrost/blockfrost-js';
import { api } from '../utils/blockfrostAPI';
import * as Types from '../types';

/*

See regular and deprecated endpoints here: https://github.com/Emurgo/yoroi-graphql-migration-backend/blob/master/src/index.ts#L228

txs/utxoForAddresses
account/registrationHistory
account/state
account/rewardHistory
pool/info
pool/delegationHistory
txs/utxoSumForAddresses
v2/addresses/filterUsed
v2/txs/history
v2/bestblock
txs/signed
v2/importerhealthcheck

*/

// const api = new BlockFrostAPI({
//   projectId: 'v4yhZTgZRjJJbLAPMOmMGtZFg3MGIWiT',
//   customBackend: 'http://localhost:3000',
// });

export const v2Importerhealthcheck = async (): Promise<any> => {
  return await api.health;
};

// export const n = (): string => {
//   return 'n';
// };
