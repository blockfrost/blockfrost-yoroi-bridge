import { FastifyInstance } from 'fastify';
import { accountRegistrationHistoryMethod } from '../methods/accountRegistrationHistory';

async function accountRegistrationHistory(fastify: FastifyInstance) {
  fastify.route({
    url: '/accountRegistrationHistory',
    method: 'GET',
    handler: async (_req, res) => {
      const result = await accountRegistrationHistoryMethod([
        'stake1u88xakeptjw9jwsytkjal76d07an4thvvrfx3w2kt77pw4sc5rr8k',
        'stake1u9p26xk0cnjccs2an3qsm6fqca3uqp3e94l6dxu6pxvxkyqxa7q82',
        'stake1uymf0aly0mz6898kupjrz96zl0t9jggwerdrqys24wv8w7qcdtdc8',
      ]);
      res.send(result);
    },
  });
}

module.exports = accountRegistrationHistory;
