import fastify, { FastifyInstance } from 'fastify';
import AutoLoad from 'fastify-autoload';
import FastifyCors from 'fastify-cors';
import path from 'path';

const start = (opts = {}): FastifyInstance => {
  const app = fastify(opts);

  app.register(AutoLoad, {
    dir: path.join(__dirname, 'endpoints/'),
    dirNameRoutePrefix: false,
  });

  app.register(FastifyCors, {
    // configure CORS
  });

  if (!process.env.PROJECT_ID) {
    throw new Error('PROJECT_ID environment variable (Blockfrost API token) MUST be set!!!');
  }

  if (
    typeof process.env.NETWORK !== 'undefined' &&
    process.env.NETWORK !== 'mainnet' &&
    process.env.NETWORK !== 'testnet'
  ) {
    throw new Error(
      'NETWORK environment variable MUST be either `mainnet` or `testnet` or not specified at all',
    );
  }

  return app;
};

start();

export default start;
