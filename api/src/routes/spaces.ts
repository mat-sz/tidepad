import { Note, NoteAttachment, Space } from '@prisma/client';
import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import sharp from 'sharp';
import { v4 } from 'uuid';
import * as path from 'path';
import { unlink, writeFile, access, mkdir } from 'fs/promises';
import createHttpError from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { selectAll } from 'unist-util-select';

import ogs from 'open-graph-scraper';
import type { OgObject } from 'open-graph-scraper/dist/lib/types.js';

import { config } from '../config.js';
import { NoteEmbed } from '../types.js';
import { filesDir } from '../storage.js';

type UnsavedAttachment = Pick<
  NoteAttachment,
  'originalFilename' | 'filename' | 'size' | 'contentType' | 'url'
> &
  Partial<
    Pick<
      NoteAttachment,
      | 'width'
      | 'height'
      | 'thumbnailWidth'
      | 'thumbnailHeight'
      | 'thumbnailFilename'
      | 'thumbnailUrl'
    >
  >;

const space = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    template: { type: 'string' },
  },
} as const;

const note = {
  type: 'object',
  properties: {
    body: { type: 'string' },
    pinned: { type: 'boolean' },
  },
} as const;

const spaceCreate = {
  ...space,
  required: ['name'],
} as const;

const noteCreate = {
  ...note,
  required: ['body'],
} as const;

const noteQuery = {
  type: 'object',
  properties: {
    around: { type: 'number' },
    after: { type: 'number' },
    before: { type: 'number' },
    limit: { type: 'number' },
    has: { type: 'string' },
    content: { type: 'string' },
    pinned: { type: 'boolean' },
    // sort: { type: 'string' },
  },
} as const;

declare module 'fastify' {
  interface FastifyRequest {
    space: Space;
    note: Note & { attachments?: NoteAttachment[] };
  }
}

const spaceSelect = { id: true, name: true, template: true };
const noteSelect = {
  id: true,
  body: true,
  authorId: true,
  createdAt: true,
  pinned: true,
  attachments: {
    select: {
      id: true,
      filename: true,
      url: true,
      originalFilename: true,
      size: true,
      contentType: true,
      height: true,
      width: true,
      thumbnailHeight: true,
      thumbnailWidth: true,
      thumbnailFilename: true,
      thumbnailUrl: true,
    },
  },
};

const attachmentsBaseUrl = config.tidepad.publicUrls.attachments;
const thumbnailsBaseUrl = config.tidepad.publicUrls.thumbnails;

function select(object: any, fields: Record<string, boolean>): any {
  const temp: any = {};
  for (const key of Object.keys(fields)) {
    if (fields[key] && typeof object[key] !== 'undefined') {
      temp[key] = object[key];
    }
  }
  return temp;
}

function findUrls(markdown: string): string[] {
  const tree = fromMarkdown(markdown, 'utf-8', {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const nodes = selectAll('link', tree);
  const urls = nodes
    .map(link => (link as any).url)
    .filter(text => {
      if (typeof text !== 'string') {
        return false;
      }

      try {
        const url = new URL(text);
        // TODO: Make sure URL doesn't point to localhost or LAN.
        // TODO: Move this to a separate microservice with caching.
        if (!url.hostname.includes('.')) {
          // This check is not secure. Make sure to validate anyway by doing a DNS lookup.
          return false;
        }
      } catch {
        return false;
      }

      return true;
    }) as string[];

  return [...new Set(urls)];
}

const noteCanEdit = (user: any, space: Space, note: { authorId: number }) =>
  note.authorId === user!.id;
const noteCanDelete = (user: any, space: Space, note: { authorId: number }) =>
  note.authorId === user!.id;

async function scrapeUrls(urls: string[]): Promise<OgObject[]> {
  const objects = await Promise.all(
    urls.map(async url => {
      try {
        const result = await (ogs as any)({
          url,
          timeout: {
            request: 1000,
          },
          headers: {
            'Accept-Language': 'en-US,en;q=0.5',
          },
        });
        if (result.result) {
          return result.result;
        }
      } catch {
        return undefined;
      }
    })
  );

  return objects.filter(obj => !!obj) as OgObject[];
}

export const spacesRoutes: FastifyPluginCallback = async fastify => {
  fastify.addHook('preHandler', fastify.expect!.toBeAuthenticated());

  fastify.get('/', async request => {
    const spaces = await fastify.prisma.space.findMany({
      where: { ownerId: request.user!.id },
      select: spaceSelect,
    });

    return spaces;
  });

  fastify.post<{ Body: FromSchema<typeof spaceCreate> }>(
    '/',
    {
      schema: {
        body: spaceCreate,
      },
    },
    async request => {
      const space = await fastify.prisma.space.create({
        data: {
          ...request.body,
          ownerId: request.user!.id,
        },
        select: spaceSelect,
      });

      return space;
    }
  );

  fastify.register(async fastify => {
    fastify.decorateRequest('space', null);

    fastify.addHook('preHandler', async request => {
      // TODO: Shared spaces.
      const id = parseInt((request.params as any)?.id);
      if (typeof id !== 'number' || isNaN(id)) {
        throw createHttpError(404, 'Space not found');
      }

      const space = await fastify.prisma.space.findFirst({
        where: { id, ownerId: request.user!.id },
      });
      if (!space) {
        throw createHttpError(404, 'Space not found');
      }

      request.space = space;
    });

    const isOwner = async (request: FastifyRequest) => {
      if (request.space.ownerId !== request.user!.id) {
        throw createHttpError(403, 'Forbidden');
      }
    };

    fastify.get('/:id', async request => {
      return select(request.space, spaceSelect);
    });

    fastify.patch<{ Body: FromSchema<typeof space> }>(
      '/:id',
      {
        schema: {
          body: space,
        },
        preHandler: [isOwner],
      },
      async request => {
        return await fastify.prisma.space.update({
          where: { id: request.space.id },
          data: { ...request.body },
          select: spaceSelect,
        });
      }
    );

    fastify.delete(
      '/:id',
      {
        preHandler: [isOwner],
      },
      async request => {
        // TODO: Prevent deletion of "Starred" space.
        await fastify.prisma.space.delete({ where: { id: request.space.id } });
        return { ok: true };
      }
    );

    const addNoteFields = (
      request: FastifyRequest,
      note: { authorId: number }
    ) => ({
      ...note,
      canEdit: noteCanEdit(request.user, request.space, note),
      canDelete: noteCanDelete(request.user, request.space, note),
    });
    const mapAddNoteFields = (
      request: FastifyRequest,
      notes: { authorId: number }[]
    ) => notes.map(note => addNoteFields(request, note));

    fastify.get<{ Querystring: FromSchema<typeof noteQuery> }>(
      '/:id/notes',
      {
        schema: {
          querystring: noteQuery,
        },
      },
      async request => {
        // TODO: Think of a better way to implement this.
        // const order = request.query.sort === 'oldest' ? 'desc' : 'asc';
        request.query.limit = Math.min(request.query.limit || 50, 50);

        if (
          request.query.around &&
          (request.query.before || request.query.after)
        ) {
          throw createHttpError(401, 'Bad request');
        }

        const where: any = { spaceId: request.space.id };
        if (request.query.before) {
          where['id'] = { lt: request.query.before };
        }
        if (request.query.after) {
          where['id'] = { ...(where['id'] || {}), gt: request.query.after };
        }
        if (request.query.content) {
          where['body'] = { contains: request.query.content };
        }
        if (request.query.pinned) {
          where['pinned'] = request.query.pinned;
        }

        const first = await fastify.prisma.note.findFirst({
          where: { spaceId: request.space.id },
          orderBy: { id: 'asc' },
          take: 1,
        });
        const last = await fastify.prisma.note.findFirst({
          where: { spaceId: request.space.id },
          orderBy: { id: 'desc' },
          take: 1,
        });

        const queryParams = {
          select: noteSelect,
          take: request.query.limit,
        } as const;

        let result: any = [];
        if (request.query.around) {
          const half = request.query.limit / 2;
          const limitBefore = Math.ceil(half);
          const limitAfter = Math.floor(half);

          // TODO: Rewrite this with one query
          const notesBefore = await fastify.prisma.note.findMany({
            where: { ...where, id: { lte: request.query.around } },
            ...queryParams,
            orderBy: { createdAt: 'desc' },
            take: limitBefore,
          });
          const notesAfter = await fastify.prisma.note.findMany({
            where: { ...where, id: { gt: request.query.around } },
            ...queryParams,
            orderBy: { createdAt: 'asc' },
            take: limitAfter,
          });

          const notes = [...notesBefore, ...notesAfter];
          // if (request.query.sort === 'oldest') {
          //   notes.reverse();
          // }
          result = mapAddNoteFields(request, notes);
        } else {
          const notes = await fastify.prisma.note.findMany({
            where,
            orderBy: { createdAt: request.query.after ? 'asc' : 'desc' },
            ...queryParams,
          });

          if (!request.query.after) {
            notes.reverse();
          }

          result = mapAddNoteFields(request, notes);
        }

        return {
          firstId: first?.id,
          lastId: last?.id,
          notes: result,
        };
      }
    );

    fastify.post<{ Body: FromSchema<typeof noteCreate> }>(
      '/:id/notes',
      async request => {
        const body: any = request.body || {};
        const attachments: UnsavedAttachment[] = [];
        const basePath = path.join(filesDir, request.space!.id.toString());

        const attachmentsUrl = `${attachmentsBaseUrl}${request.space!.id}/`;
        const thumbnailsUrl = `${thumbnailsBaseUrl}${request.space!.id}/`;

        try {
          await access(basePath);
        } catch {
          await mkdir(basePath);
        }

        if (request.isMultipart()) {
          const files = request.files();

          // TODO: Move those to background, so sending the message isn't slow.
          // TODO: Also, only save them if all the other checks pass...
          for await (const part of files) {
            for (const key of Object.keys(part.fields)) {
              const field = part.fields[key];
              if (!field) {
                continue;
              }

              body[key] = 'value' in field ? field.value : undefined;
            }

            const split = part.filename.split('.');
            const extension =
              split.length > 1 ? '.' + split[split.length - 1] : '';
            const uuid = v4();
            const filename = `${uuid}${extension}`; // TODO: detect extension

            const buffer = await part.toBuffer();
            writeFile(path.join(basePath, filename), buffer);

            const attachment: UnsavedAttachment = {
              filename: filename,
              originalFilename: part.filename,
              contentType: part.mimetype,
              size: buffer.byteLength,
              url: attachmentsUrl + filename,
            };

            if (part.mimetype.startsWith('image/')) {
              const thumbnailFilename = `${uuid}.thumb.jpg`;
              const img = sharp(buffer);
              const metadata = await img.metadata();
              attachment.height = metadata.height;
              attachment.width = metadata.width;

              const info = await img
                .resize(500, 400, { fit: 'inside' })
                .jpeg()
                .toFile(path.join(basePath, thumbnailFilename));
              attachment.thumbnailHeight = info.height;
              attachment.thumbnailWidth = info.width;
              attachment.thumbnailFilename = thumbnailFilename;
              attachment.thumbnailUrl = thumbnailsUrl + thumbnailFilename;
            }

            attachments.push(attachment);
          }
        }

        if (attachments.length > 0 && typeof body.body !== 'string') {
          body.body = '';
        }

        // TODO: better validation
        if (typeof body.body !== 'string') {
          throw new Error('Bad request');
        }

        const urls = findUrls(body.body);
        const ogObjects = await scrapeUrls(urls);

        for (const object of ogObjects) {
          if (!object.requestUrl || !object.ogTitle) {
            continue;
          }

          const embed = {
            author: object.ogSiteName
              ? {
                  text: object.ogSiteName,
                  icon_url: object.favicon
                    ? new URL(object.favicon, object.requestUrl).toString()
                    : undefined,
                }
              : undefined,
            url: object.requestUrl,
            title: object.ogTitle,
            description: object.ogDescription,
            image:
              typeof object.ogImage === 'object' && 'url' in object.ogImage
                ? {
                    url: new URL(
                      object.ogImage.url,
                      object.requestUrl
                    ).toString(),
                    height: object.ogImage.height,
                    width: object.ogImage.width,
                  }
                : undefined,
          };

          body.body += `\n\n\`\`\`embed\n${JSON.stringify(embed)}\n\`\`\``;
        }

        // TODO: Readonly shared spaces? Starred?
        const note = await fastify.prisma.note.create({
          data: {
            ...body,
            authorId: request.user.id,
            spaceId: request.space.id,
            pinned: false,
            attachments: { create: attachments },
          },
          select: noteSelect,
        });

        return { ...note, canEdit: true, canDelete: true };
      }
    );

    fastify.register(async fastify => {
      fastify.decorateRequest('note', null);

      fastify.addHook('preHandler', async request => {
        const id = parseInt((request.params as any)?.noteId);
        if (typeof id !== 'number' || isNaN(id)) {
          throw createHttpError(404, 'Note not found');
        }

        const note = await fastify.prisma.note.findFirst({
          where: { id, spaceId: request.space.id },
          include: { attachments: true },
        });
        if (!note) {
          throw createHttpError(404, 'Note not found');
        }

        request.note = note;
      });

      const canDeleteHandler = async (request: FastifyRequest) => {
        if (!noteCanDelete(request.user, request.space, request.note)) {
          throw createHttpError(403, 'Forbidden');
        }
      };

      const canEditHandler = async (request: FastifyRequest) => {
        if (!noteCanEdit(request.user, request.space, request.note)) {
          throw createHttpError(403, 'Forbidden');
        }
      };

      // fastify.get('/:id/notes/:noteId', async request => {
      //   return select(request.note, noteSelect);
      // });

      fastify.patch<{ Body: FromSchema<typeof note> }>(
        '/:id/notes/:noteId',
        {
          schema: {
            body: note,
          },
          preHandler: [canEditHandler],
        },
        async request => {
          const note = await fastify.prisma.note.update({
            where: { id: request.note.id },
            data: { ...request.body },
            select: noteSelect,
          });
          return addNoteFields(request, note);
        }
      );

      fastify.delete(
        '/:id/notes/:noteId',
        { preHandler: [canDeleteHandler] },
        async request => {
          // TODO: Delete embeds/attachments.
          if (request.note.attachments?.length) {
            const baseDir = path.join(filesDir, request.space.id!.toString());

            for (const attachment of request.note.attachments) {
              unlink(path.join(baseDir, attachment.filename)).catch(() => {
                //
              });

              if (attachment.thumbnailFilename) {
                unlink(path.join(baseDir, attachment.thumbnailFilename)).catch(
                  () => {
                    //
                  }
                );
              }
            }

            await fastify.prisma.noteAttachment.deleteMany({
              where: { noteId: request.note.id },
            });
          }

          await fastify.prisma.note.delete({
            where: { id: request.note.id },
          });
          return { ok: true };
        }
      );
    });
  });
};
