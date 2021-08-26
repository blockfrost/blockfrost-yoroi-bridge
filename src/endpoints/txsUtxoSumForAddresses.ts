import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { txsUtxoSumForAddressesMethod } from '../methods/txsUtxoSumForAddresses';

async function txsUtxoSumForAddresses(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/txs/utxoSumForAddresses',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqAddresses>, res) => {
      if (req.body && req.body.addresses) {
        const uniqueAddresses = [...new Set(req.body.addresses)];

        const result = await txsUtxoSumForAddressesMethod(uniqueAddresses);
        res.send(result);
      } else {
        throw new Error('error, no addresses.');
      }
    },
  });
}

module.exports = txsUtxoSumForAddresses;
