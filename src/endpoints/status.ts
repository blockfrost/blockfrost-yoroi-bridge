import { FastifyInstance } from 'fastify';
import { getApi } from '../utils/blockfrostAPI';

async function status(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/status',
    method: 'GET',
    handler: async (_req, res) => {
      const api = getApi(); // true = mainnet, false = testnet

      const nodeStatus = await api.health();
      const nodeTime = await api.healthClock();

      if (nodeStatus.is_healthy) {
        res.send({
          isServerOk: true, // heartbeat endpoint for server. IF you want the node status, use v2/importerhealthcheck instead
          isMaintenance: false, // manually set and indicates you should disable ADA integration in your app until it returns false. Use to avoid weird app-side behavior during server upgrades.
          serverTime: nodeTime.server_time, // in millisecond unix time
        });
      } else {
        res.send({
          isServerOk: false, // heartbeat endpoint for server. IF you want the node status, use v2/importerhealthcheck instead
          isMaintenance: false, // manually set and indicates you should disable ADA integration in your app until it returns false. Use to avoid weird app-side behavior during server upgrades.
          serverTime: nodeTime.server_time, // in millisecond unix time
        });
      }
    },
  });
}

module.exports = status;
