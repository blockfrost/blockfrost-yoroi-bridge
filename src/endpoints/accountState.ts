import { FastifyInstance } from 'fastify';
import { accountStateMethod } from '../methods/accountState';
import { bech32 } from 'bech32';

async function accountState(fastify: FastifyInstance) {
  fastify.route({
    url: '/account/state',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      //TODO: until we use req.body
      const testingInput: string[] = [
        '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
        '0840d05089b5bff1e24fe57c1ed905cd6fda68e1147a5b5863d39562',
      ];

      const pools: string[] = [];

      // TODO: use req.body !!!
      testingInput.map(pool => {
        const encoded = bech32.encode(
          'pool',
          bech32.toWords(Uint8Array.from(Buffer.from(pool, 'hex'))),
          1000,
        );

        pools.push(encoded);
      });

      const result = await accountStateMethod(pools);
      res.send(result);
    },
  });
}

module.exports = accountState;
