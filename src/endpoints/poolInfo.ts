import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { poolInfoMethod } from '../methods/poolInfo';

async function poolInfo(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/pool/info',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqPools>, res) => {
      if (req.body && req.body.poolIds) {
        const rawPools = req.body.poolIds;

        const uniquePools = [...new Set(rawPools)];

        const result = await poolInfoMethod(uniquePools);
        res.send(result);
      } else {
        throw new Error('No poolIds in body');
      }
    },
  });
}

module.exports = poolInfo;
