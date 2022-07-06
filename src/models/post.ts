import type { Post } from '@prisma/client'
import { z } from 'zod'

export type PostData = {
  title: string
  subtitle: string
} & (
  | { isReply: true; innerPost: PostData }
  | { isReply: false; imageUrl: string }
)

export type PostWithMeta = PostData & {
  id: string
  created: Date
}

export const postSchema: z.ZodType<PostData> = z.lazy(() =>
  z
    .object({
      title: z.string().min(1),
      subtitle: z.string(),
    })
    .and(
      z.discriminatedUnion('isReply', [
        z.object({ isReply: z.literal(true), innerPost: postSchema }),
        z.object({ isReply: z.literal(false), imageUrl: z.string() }),
      ])
    )
)

export function parsePrismaPost(post: Post) {
  const data = JSON.parse(post.stringified)
  return { ...data, isReply: !data.imageUrl } as PostWithMeta
}
