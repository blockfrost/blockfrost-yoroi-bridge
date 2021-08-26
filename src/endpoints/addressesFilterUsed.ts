import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { addressesFilterUsedMethod } from '../methods/addressesFilterUsed';

async function v2addressesFilterUsed(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/v2/addresses/filterUsed',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqAddresses>, res) => {
      if (req.body && req.body.addresses) {
        const uniqueAddresses = [...new Set(req.body.addresses)];

        try {
          const result = await addressesFilterUsedMethod(uniqueAddresses);
          res.send(result);
        } catch (err) {
          console.log(err);
        }
      } else {
        throw new Error('error, no addresses.');
      }
    },
  });
}

module.exports = v2addressesFilterUsed;
