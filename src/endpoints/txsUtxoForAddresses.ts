import { FastifyInstance } from 'fastify';
import { txsUtxoForAddressesMethod } from '../methods/txsUtxoForAddresses';

async function txsUtxoForAddresses(fastify: FastifyInstance) {
  fastify.route({
    url: '/txs/utxoForAddresses',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      // TODO: use req.body !!!

      // addr inputs and outputs are NOT hex!!!

      const result = await txsUtxoForAddressesMethod([
        'addr1qxxs87vl008e454e0scnaj3fdgawd304gue9y3393awvgtwlwp5lvnlrkc0v7qvpgn0rgls64pzemmvrd8s76m66caxspg2gwx',
        'addr1q9ngaltmxt8xy6e50senzpw69k03rmtdq6rg2hy32v0lhj2jjwpklcmvmfq9zgredhjy0u9we4njqmuzpynl6v3sx30qtx65h3',
      ]);
      res.send(result);
    },
  });
}

module.exports = txsUtxoForAddresses;
