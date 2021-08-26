import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Types from '../types';
import { txshistoryMethod } from '../methods/txsHistory';

async function txsHistory(fastify: FastifyInstance) {
  fastify.route({
    url: '/api/v2/txs/history',
    method: 'POST',
    handler: async (req: FastifyRequest<Types.ReqTxsHistory>, res) => {
      if (req.body && req.body.addresses && req.body.untilBlock) {
        const uniqueAddresses = [...new Set(req.body.addresses)];

        const untilBlock = req.body.untilBlock;
        let afterBlock: string | undefined = undefined;
        let afterTx: string | undefined = undefined;

        if (req.body.after) {
          afterBlock = req.body.after.block;
          afterTx = req.body.after.tx;
        }
        try {
          const result = await txshistoryMethod(uniqueAddresses, afterBlock, afterTx, untilBlock);
          res.send(result);
        } catch (err) {
          console.log(err);
          throw new Error('Error');
        }
      } else {
        throw new Error('error, no addresses.');
      }
    },
  });
}

module.exports = txsHistory;
