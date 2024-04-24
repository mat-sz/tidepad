import { FastifyPluginCallback } from 'fastify';
import { config } from '../config.js';

export const instanceRoutes: FastifyPluginCallback = async fastify => {
  fastify.addHook('preHandler', fastify.expect!.toBeAuthenticated());

  fastify.get('/info', () => {
    return {
      limits: {
        ...config.tidepad.limits,
      },
    };
  });
};
