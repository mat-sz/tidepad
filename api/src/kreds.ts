import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

import { Kreds } from '@kreds/server';
import { OIDCAuthenticationStrategy } from '@kreds/strategy-oidc';
import { JWTStrategy } from '@kreds/strategy-jwt';
import { BearerStrategy } from '@kreds/strategy-bearer';
import { MockAuthenticationStrategy } from '@kreds/strategy-mock';

import { config } from './config.js';

const prisma = new PrismaClient();

interface UserData {
  id: number;
  email?: string;
  name?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const kreds = new Kreds<UserData>();
kreds.setCallbackRedirectUrl(config.kreds.redirectUrl);
kreds.displayUser = user => {
  if (!user) {
    return undefined;
  }

  return prisma.user.findFirst({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      settingsJson: true,
      orderJson: true,
    },
  });
};
kreds.use(
  'session',
  new BearerStrategy({
    authorizationType: 'Bearer',
    verify: async (context, data) => {
      const session = await prisma.session.findFirst({
        where: { token: data },
        include: { user: true },
      });
      const user = session?.user;
      if (!session || !user?.kredsAuth) {
        return {
          done: true,
        };
      }

      // Should not happen.
      if (user.kredsStrategy === context.strategyName) {
        return {
          done: true,
        };
      }

      const auth = await kreds.authenticate(
        user.kredsStrategy,
        JSON.parse(user.kredsAuth)
      );
      if (!auth?.user) {
        return {
          done: true,
        };
      }

      await prisma.session.update({
        where: { id: session.id },
        data: {
          updatedAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { email: auth.user.email, name: auth.user.name },
      });

      const userData: UserData = {
        id: user.id,
        email: auth.user.email || user.email || undefined,
        name: auth.user.name || user.name || undefined,
      };

      await kreds.store('jwt', context, userData);

      return {
        done: true,
        user: userData,
        refreshStrategy: {
          name: 'session',
          payload: session.token,
        },
      };
    },
    destroy: async (_, data) => {
      await prisma.session.delete({ where: { token: data } });
    },
  })
);

for (const strategy of config.kreds.strategies) {
  if (strategy.type === 'jwt') {
    kreds.use(
      strategy.name,
      new JWTStrategy({
        ...strategy,
        verify: async (_, data) => {
          const jwt = data.payload as any;
          if (typeof jwt !== 'object') {
            return {
              done: false,
            };
          }

          return {
            done: true,
            user: jwt,
          };
        },
        store: async (_, user) => {
          return user;
        },
      })
    );
  } else {
    const constructor =
      strategy.type === 'oauth2-oidc'
        ? OIDCAuthenticationStrategy
        : MockAuthenticationStrategy;
    kreds.use(
      strategy.name,
      new constructor({
        ...strategy,
        verify: async (context, data) => {
          let user = await prisma.user.findFirst({
            where: {
              kredsId: data.userInfo.sub,
              kredsStrategy: context.strategyName!,
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: data.userInfo.email,
                name:
                  data.userInfo.name ||
                  data.userInfo.nickname ||
                  data.userInfo.email,
                kredsId: data.userInfo.sub,
                kredsStrategy: context.strategyName!,
                kredsAuth: JSON.stringify({
                  refresh_token: data.token.refresh_token,
                }),
              },
            });

            // TODO: Create "Starred" space.
          } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                kredsAuth: JSON.stringify({
                  refresh_token: data.token.refresh_token,
                }),
              },
            });
          }

          const userData: UserData = {
            id: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
          };

          const session = await prisma.session.create({
            data: {
              token: randomBytes(64).toString('base64'),
              userId: user.id,
            },
          });

          await kreds.store('jwt', context, userData);

          return {
            done: true,
            user: userData,
            refreshStrategy: {
              name: 'session',
              payload: session.token,
            },
          };
        },
      })
    );
    kreds.setPrimaryStrategy(strategy.name);
  }
}

export { kreds };
