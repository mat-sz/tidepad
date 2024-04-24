/// <reference types="@kreds/fastify/types" />

import path from 'path';
import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyHttpProxy from '@fastify/http-proxy';
import { fastifyKredsUser, fastifyKredsRoutes } from '@kreds/fastify';

import { spacesRoutes } from './routes/spaces.js';
import { userRoutes } from './routes/user.js';
import { instanceRoutes } from './routes/instance.js';
import { kreds } from './kreds.js';
import { logger } from './logger.js';
import { config } from './config.js';
import { filesDir } from './storage.js';

const prisma = new PrismaClient();
const app = Fastify();

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

app.decorate('prisma', prisma);
app.register(fastifyStatic, {
  root: path.resolve(filesDir),
  prefix: '/attachments/',
});
app.register(fastifyMultipart, {
  limits: {
    fileSize: config.tidepad.limits.files.size,
    files: config.tidepad.limits.files.count,
  },
});
app.register(fastifyKredsUser, { kreds });
app.register(fastifyKredsRoutes, { prefix: '/kreds', kreds });
app.register(
  async app => {
    app.register(spacesRoutes, { prefix: '/spaces' });
    app.register(userRoutes, { prefix: '/user' });
    app.register(instanceRoutes, { prefix: '/instance' });
  },
  { prefix: '/api/v1' }
);

if (config.tidepad.useProxy) {
  app.register(fastifyHttpProxy, {
    upstream: 'http://localhost:3000/',
    websocket: true,
  });
} else {
  const STATIC_ROOT = path.resolve('../web/build');

  app.setNotFoundHandler((_, reply) => {
    reply.sendFile('index.html', STATIC_ROOT);
  });
  app.register(fastifyStatic, {
    root: STATIC_ROOT,
    prefix: '/',
    index: 'index.html',
    decorateReply: false,
  });
}

app.listen({ port: 4000, host: '0.0.0.0' }, (err, address) => {
  if (!err) {
    logger.info(`server listening on ${address}`);
  } else {
    logger.error(err);
  }
});
