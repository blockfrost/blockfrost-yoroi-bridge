import { FastifyInstance } from 'fastify';
import { v2txshistoryMethod } from '../methods/v2txshistory';

async function v2txshistory(fastify: FastifyInstance) {
  fastify.route({
    url: '/v2/txs/history',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      // TODO: use req.body !!!
      const input: string[] = [
        // TODO: input
        //'addr1vkoko',
        'addr1qxxs87vl008e454e0scnaj3fdgawd304gue9y3393awvgtwlwp5lvnlrkc0v7qvpgn0rgls64pzemmvrd8s76m66caxspg2gwx',
        'addr1qym52jyjcu0fvxe6p4nnytq54e9r7vrs52lwx8f0q8d25k3hg4yf93c7jcdn5rt8xgkpftj28uc8pg47uvwj7qw64fdqcg6vz7',
        'addr1qx2cpy48yv8k8rhc96dkxlhn9dg5ta8fgt4awdugu0tw6cu9neyz0s3fcz78elntfvxq5nce8t663w3ht47g6yu34ejqtupkr2',
        //'addr1v95sf69jcfhnmknvffwmfvlvnccatqwfjcyh0nlfc6gh5scta2yzg', //120k txs
        //'addr1v95sf69jcfhnmknvffwmfvlvnccatqwfjcyh0nlfc6gh5scta2yzh',
      ];
      // addr inputs and outputs are NOT hex!!!

      const result = await v2txshistoryMethod(input);
      res.send(result);
    },
  });
}

module.exports = v2txshistory;
