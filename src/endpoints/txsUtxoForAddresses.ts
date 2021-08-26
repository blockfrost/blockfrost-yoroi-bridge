import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { txsUtxoForAddressesMethod } from '../methods/txsUtxoForAddresses';

async function txsUtxoForAddresses(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/txs/utxoForAddresses',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqAddresses>, res) => {
      if (req.body && req.body.addresses) {
        const uniqueAddresses = [...new Set(req.body.addresses)];

        const result = await txsUtxoForAddressesMethod(uniqueAddresses);
        res.send(result);
      } else {
        throw new Error('error, no addresses.');
      }
    },
  });
}

module.exports = txsUtxoForAddresses;
