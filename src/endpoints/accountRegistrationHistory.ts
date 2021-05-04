import { FastifyInstance } from 'fastify';

async function accountRegistrationHistory(fastify: FastifyInstance) {
  fastify.route({
    url: '/accountRegistrationHistory',
    method: 'GET',
    handler: async (_req, res) => {
      res.send({ it_is_alive: true });
    },
  });
}

module.exports = accountRegistrationHistory;
