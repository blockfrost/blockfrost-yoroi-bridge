import fastify, { FastifyInstance } from 'fastify';
import AutoLoad from 'fastify-autoload';
import path from 'path';

const start = (opts = {}): FastifyInstance => {
  const app = fastify(opts);

  app.register(AutoLoad, {
    dir: path.join(__dirname, 'endpoints/'),
    dirNameRoutePrefix: false,
  });

  return app;
};

start();

export default start;
