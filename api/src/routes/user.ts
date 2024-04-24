import { FastifyPluginCallback } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

const data = {
  type: 'object',
  properties: {
    settingsJson: { type: 'string' },
    orderJson: { type: 'string' },
  },
} as const;

export const userRoutes: FastifyPluginCallback = async fastify => {
  fastify.addHook('preHandler', fastify.expect!.toBeAuthenticated());

  fastify.patch<{ Body: FromSchema<typeof data> }>(
    '/data',
    {
      schema: {
        body: data,
      },
    },
    async request => {
      await fastify.prisma.user.update({
        data: {
          settingsJson: request.body.settingsJson,
          orderJson: request.body.orderJson,
        },
        where: {
          id: request.user!.id,
        },
      });

      return { ok: true };
    }
  );
};
