import { getApi } from '../utils/blockfrostAPI';
import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';

async function txsSigned(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/txs/signed',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqTxsSigned>, res) => {
      if (req.body && req.body.signedTx) {
        try {
          const api = getApi();
          const buffer = Buffer.from(req.body.signedTx, 'base64');

          // send tx
          await api.txSubmit(buffer);

          //const result = await api.txSubmit(buffer);
          // don't send any output on success
          res.send([]);
        } catch (err) {
          if (err.status_code === 400) {
            console.log(err);
            const msg = `Transaction was rejected: ${err.message}`;
            console.log('signedTransaction request body: ' + req.body.signedTx);
            throw Error(msg);
          } else {
            const msg = `Error trying to send transaction: ${err} - ${err.message}`;
            throw Error(msg);
          }
        }
      } else {
        throw new Error('No signedTx in body');
      }
    },
  });
}

module.exports = txsSigned;
