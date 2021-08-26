import { network } from '../config';
import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { accountStateMethod } from '../methods/accountState';
import { bech32 } from 'bech32';

async function accountState(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/account/state',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqAccounts>, res) => {
      if (req.body && req.body.addresses) {
        let networkPrefix = '';

        if (network === 'mainnet') {
          networkPrefix = 'stake';
        } else {
          networkPrefix = 'stake_test';
        }

        const accounts: string[] = [];

        const uniqueAddresses = [...new Set(req.body.addresses)];

        uniqueAddresses.map(account => {
          const encoded = bech32.encode(
            networkPrefix,
            bech32.toWords(Uint8Array.from(Buffer.from(account, 'hex'))),
            1000,
          );

          accounts.push(encoded);
        });
        const result = await accountStateMethod(accounts);
        res.send(result);
      } else {
        throw new Error('error, no addresses.');
      }
    },
  });
}

module.exports = accountState;
