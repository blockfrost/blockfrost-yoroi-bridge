import { network } from '../config';
import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { accountRewardHistoryMethod } from '../methods/accountRewardHistory';
import { bech32 } from 'bech32';

async function accountRewardHistory(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/account/rewardHistory',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqAccounts>, res) => {
      if (req.body && req.body.addresses) {
        let networkPrefix = '';

        const accounts: string[] = [];

        const uniqueAddresses = [...new Set(req.body.addresses)];

        if (network === 'mainnet') {
          networkPrefix = 'stake';
        } else {
          networkPrefix = 'stake_test';
        }

        uniqueAddresses.map(account => {
          const encoded = bech32.encode(
            networkPrefix,
            bech32.toWords(Uint8Array.from(Buffer.from(account, 'hex'))),
            1000,
          );

          accounts.push(encoded);
        });
        const result = await accountRewardHistoryMethod(accounts);
        res.send(result);
      } else {
        throw new Error('error, no addresses.');
      }
    },
  });
}

module.exports = accountRewardHistory;
