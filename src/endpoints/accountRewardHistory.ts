import { FastifyInstance } from 'fastify';
import { accountRewardHistoryMethod } from '../methods/accountRewardHistory';
import { bech32 } from 'bech32';

async function accountRewardHistory(fastify: FastifyInstance) {
  fastify.route({
    url: '/account/rewardHistory',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      //TODO: until we use req.body
      const testingInput: string[] = [
        'e1ce6edb215c9c593a045da5dffb4d7fbb3aaeec60d268b9565fbc1756',
        'e142ad1acfc4e58c415d9c410de920c763c006392d7fa69b9a09986b10',
        'e13697f7e47ec5a394f6e064311742fbd659210ec8da30120aab987778',
      ];

      const addresses: string[] = [];

      //TODO: differentiate between testnet and mainnet
      // TODO: use req.body !!!
      testingInput.map(address => {
        const encoded = bech32.encode(
          'stake',
          bech32.toWords(Uint8Array.from(Buffer.from(address, 'hex'))),
          1000,
        );

        addresses.push(encoded);
      });

      const result = await accountRewardHistoryMethod(addresses);
      res.send(result);
    },
  });
}

module.exports = accountRewardHistory;
