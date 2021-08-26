import { FastifyInstance } from 'fastify';
import { getApi } from '../utils/blockfrostAPI';

async function status(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/v2/bestblock',
    method: 'GET',
    handler: async (_req, res) => {
      const api = getApi(); // true = mainnet, false = testnet

      const latestBlock = await api.blocksLatest();

      if (latestBlock) {
        res.send({
          // 0 if no blocks in db
          height: latestBlock.height,
          // null when no blocks in db
          epoch: latestBlock.epoch,
          slot: latestBlock.slot,
          hash: latestBlock.hash,
        });
      } else {
        res.send({
          // 0 if no blocks in db
          height: 0,
          // null when no blocks in db
          epoch: null,
          slot: null,
          hash: null,
        });
      }
    },
  });
}

module.exports = status;
