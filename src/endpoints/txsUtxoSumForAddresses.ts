import { FastifyInstance } from 'fastify';
import { txsUtxoSumForAddressesMethod } from '../methods/txsUtxoSumForAddresses';

async function txsUtxoSumForAddresses(fastify: FastifyInstance) {
  fastify.route({
    url: '/txs/utxoSumForAddresses',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      // TODO: use req.body !!!

      // addr inputs and outputs are NOT hex!!!

      const result = await txsUtxoSumForAddressesMethod([
        'addr1qxxs87vl008e454e0scnaj3fdgawd304gue9y3393awvgtwlwp5lvnlrkc0v7qvpgn0rgls64pzemmvrd8s76m66caxspg2gwx',
        'addr1v95sf69jcfhnmknvffwmfvlvnccatqwfjcyh0nlfc6gh5scta2yzg',
      ]);
      res.send(result);
    },
  });
}

module.exports = txsUtxoSumForAddresses;
