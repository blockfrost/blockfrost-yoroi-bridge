import { FastifyInstance } from 'fastify';
import { poolInfoMethod } from '../methods/poolInfo';
import { bEncodeMultiplePools } from '../utils';

async function poolInfo(fastify: FastifyInstance) {
  fastify.route({
    url: '/pool/info',
    method: 'GET', // TODO: POST
    handler: async (_req, res) => {
      // TODO: use req.body !!!
      // have to do this nonsense for each, create an array
      const pools: string[] = [];

      // foreach...
      pools.push(
        //'0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
        //'16d216d074625d2dbb75c20948e4d9a1efe0fe79c4c915d4b5391de1',
        '878cc596b488c7cba5b82bda47a8dcc9d5b9b15f11008118c7843780',
      );
      // TODO: implement taking inputs as hex e.g.: 0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735
      const encoded = bEncodeMultiplePools(pools);
      const result = await poolInfoMethod(encoded);
      res.send(result);
    },
  });
}

module.exports = poolInfo;
