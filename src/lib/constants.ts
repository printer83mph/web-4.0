import { z } from 'zod'

import type { Post } from './types'

export const TRPC_URL = '/trpc'

export const POST_SCHEMA = z.lazy(() =>
  z.intersection(
    z.discriminatedUnion('reply', [
      z.object({
        reply: z.literal(false),
        imageUrl: z.string(),
      }),
      z.object({
        reply: z.literal(true),
        innerPost: POST_SCHEMA,
      }),
    ]),
    z.object({
      title: z.string().min(1).max(90),
      subtitle: z.string(),
    })
  )
) as z.ZodType<Post>
