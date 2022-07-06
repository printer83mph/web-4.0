import { parsePrismaPost, type PostData } from './post'

import prisma from '$lib/prisma'

export async function createPost({ isReply, ...post }: PostData) {
  return prisma.post.create({ data: { stringified: JSON.stringify(post) } })
}

export async function getPosts({ from, to }: { from?: Date; to?: Date } = {}) {
  const response = await prisma.post.findMany({
    where: {
      created: {
        gte: from,
        lte: to,
      },
    },
  })
  return response.map(parsePrismaPost)
}
