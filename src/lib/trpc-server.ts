import * as trpc from '@trpc/server'
import { z } from 'zod'

import prisma from './prisma'
import imgur from './imgur'

import { parsePrismaPost, postSchema } from '$models/post'
import { createPost } from '$models/post-actions'

export const router = trpc
  .router()
  .query('posts', {
    input: z
      .object({ from: z.date().optional(), to: z.date().optional() })
      .refine(({ from, to }) => !from || !to || from.getTime() < to.getTime())
      .optional(),
    async resolve({ input: { from, to } = {} }) {
      const posts = await prisma.post.findMany({
        where: {
          created: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { created: 'asc' },
      })
      return posts.map(parsePrismaPost)
    },
  })
  .mutation('new-post', {
    input: postSchema,
    async resolve({ input }) {
      const post = await createPost(input)
      return parsePrismaPost(post)
    },
  })
  .mutation('upload-image', {
    input: z.string().min(1),
    async resolve({ input: image }) {
      const response = await imgur.upload({ image, type: 'stream' })
      return response.data.link
    },
  })

export type Router = typeof router
