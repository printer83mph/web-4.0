import * as trpc from '@trpc/server'
import { z } from 'zod'

import prisma from './prisma'
import { POST_SCHEMA } from './constants'

export const router = trpc
  .router()
  // queries and mutations...
  .query('posts', {
    input: z
      .object({ from: z.date().optional(), to: z.date().optional() })
      .refine(({ from, to }) => !from || !to || from.getTime() < to.getTime()),
    resolve: async ({ input: { from, to } }) => {
      return prisma.post.findMany({
        where: {
          created: {
            ...(from ? { gte: from } : null),
            ...(to ? { lte: to } : null),
          },
        },
      })
    },
  })
  .mutation('new-post', {
    input: POST_SCHEMA,
    // we are taking it out bc we dont need it.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolve: async ({ input: { reply, ...input } }) => {
      return await prisma.post.create({
        data: { postData: { set: input } },
      })
    },
  })

export type Router = typeof router
