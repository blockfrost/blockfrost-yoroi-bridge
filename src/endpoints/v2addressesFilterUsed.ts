import { FastifyInstance } from 'fastify';
import { v2addressesFilterUsedMethod } from '../methods/v2addressesFilterUsed';

async function v2addressesFilterUsed(fastify: FastifyInstance) {
  fastify.route({
    url: '/v2/addresses/filterUsed',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      // TODO: use req.body !!!

      // addr inputs and outputs are NOT hex!!!

      const result = await v2addressesFilterUsedMethod([
        'addr1vkoko',
        'addr1qxxs87vl008e454e0scnaj3fdgawd304gue9y3393awvgtwlwp5lvnlrkc0v7qvpgn0rgls64pzemmvrd8s76m66caxspg2gwx',
        'addr1v95sf69jcfhnmknvffwmfvlvnccatqwfjcyh0nlfc6gh5scta2yzg',
        'addr1v95sf69jcfhnmknvffwmfvlvnccatqwfjcyh0nlfc6gh5scta2yzh',
      ]);
      res.send(result);
    },
  });
}

module.exports = v2addressesFilterUsed;
