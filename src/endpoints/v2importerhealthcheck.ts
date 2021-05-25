import { FastifyInstance } from 'fastify';
import { api } from '../utils/blockfrostAPI';

async function v2importerhealthcheck(fastify: FastifyInstance) {
  fastify.route({
    url: '/v2/importerhealthcheck',
    method: 'GET',
    handler: async (_req, res) => {
      const nodeStatus = await api.health();
      console.log(nodeStatus.is_healthy);
      if (nodeStatus.is_healthy) {
        res.send({ code: 200, message: 'Importer is OK' });
      } else {
        res.send({ code: 500, message: 'Node is not syncing' });
      } // TODO: what kind of error?
    },
  });
}

module.exports = v2importerhealthcheck;
