import type { Post } from '@prisma/client'
import seedrandom from 'seedrandom'
import { z } from 'zod'

import {
  FAKE_POST_PROBABILITIES as probabilities,
  FAKE_POST_STRINGS,
  MAX_FAKE_POSTS,
  MIN_FAKE_POSTS,
} from '$lib/constants'
import { randomCharacter } from '$lib/data-util'

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
        z.object({
          isReply: z.literal(false),
          imageUrl: z.string().min(1).url('Invalid URL'),
          // .regex(/\.(jpeg|jpg|gif|png|webp)$/, {
          //   message: 'Invalid image URL',
          // }),
        }),
      ])
    )
)

export function parsePrismaPost({ id, created, stringified }: Post) {
  const data = JSON.parse(stringified)
  return { ...data, isReply: !data.imageUrl, id, created } as PostWithMeta
}

const getRandomPart = (
  type: keyof typeof FAKE_POST_STRINGS,
  random: number,
  chance?: number
) => {
  const possibleStrings = FAKE_POST_STRINGS[type]
  if (chance === undefined) {
    return possibleStrings[Math.floor(random * possibleStrings.length)]
  }
  if (random > chance) return undefined
  const uniformRandom = random / chance
  return possibleStrings[
    Math.floor(uniformRandom * possibleStrings.length)
  ] as string
}

const generatePost = (
  getRandom: (key: string) => number
): PostData & { id: string } => {
  // unique id
  const id = `fake-${getRandom('id').toString()}`

  // title parts to be joined
  const titleParts: (string | undefined)[] = []
  const subtitleParts: (string | undefined)[] = []
  let subtitlePunctuation = false

  // util functions to add parts to title and such
  const addRandomTitle = (
    key: keyof typeof FAKE_POST_STRINGS,
    probability?: number
  ) => {
    titleParts.push(getRandomPart(key, getRandom(key), probability))
  }
  const addRandomSubtitle = (
    key: keyof typeof FAKE_POST_STRINGS,
    probability?: number
  ) => {
    subtitleParts.push(getRandomPart(key, getRandom(key), probability))
  }

  // determine if nested or not
  const isReply = getRandom('isReply') < probabilities.isReply
  let typedData:
    | { isReply: true; innerPost: PostData }
    | { isReply: false; imageUrl: string }
  if (isReply) {
    const { reply } = probabilities

    // nested post generation
    typedData = {
      isReply,
      innerPost: generatePost((k) => getRandom(`replyPost-${k}`)),
    }

    // decide what kind of reply
    const isReaction = getRandom('isReaction') < reply.isReaction
    if (isReaction) {
      const { reaction } = reply
      // reaction reply post
      addRandomTitle('holyShit', reaction.holyShit)
      addRandomTitle('thisShitIs', reaction.holyShit)
      addRandomTitle('so', reaction.so)
      addRandomTitle('adjective')
      addRandomTitle('dude', reaction.dude)
    } else if (getRandom('isInsult') < reply.isInsult) {
      // insult reply post
      const { insult } = reply
      addRandomTitle('hey', insult.hey)
      addRandomTitle('dude', insult.dude1)
      addRandomTitle('fuckYou')
      if (titleParts.length < 2) {
        addRandomTitle('dude', insult.dude2)
      }
    } else {
      // specific reply post
      addRandomTitle('specificReply')
    }
  } else {
    // independent post
    typedData = { isReply, imageUrl: 'https://i.imgur.com/9nCOmXq.png' }

    const isNews = getRandom('isNews') < probabilities.isNews
    if (isNews) {
      const { news } = probabilities
      addRandomTitle('thisIs', news.thisIs)
      addRandomTitle('cnn')
      addRandomTitle('withNews', news.withNews)
    }
  }

  if (subtitleParts.length === 0) {
    if (getRandom('subtitleIsSame') < probabilities.subtitle.isSame) {
      subtitleParts.push(...titleParts)
      addRandomSubtitle('dude', probabilities.subtitle.same.hasExtraBro)
      subtitlePunctuation = true
    } else if (
      getRandom('subtitleIsSingleWord') < probabilities.subtitle.isSingleWord
    ) {
      addRandomSubtitle('subtitleOneWord')
      subtitlePunctuation =
        getRandom('subtitleHasPunc') <
        probabilities.subtitle.singleWord.hasPunctuation
    } else if (getRandom('subtitleIsIdiom') < probabilities.subtitle.isIdiom) {
      addRandomSubtitle('subtitleIdiom')
      subtitlePunctuation = true
    } else {
      addRandomSubtitle('subtitleSpecific')
    }
  }

  let title = titleParts.filter((p) => p !== undefined).join(' ')
  const hasTypo = getRandom('hasTypo')
  if (hasTypo < probabilities.hasTypo) {
    const uniformRandom = hasTypo / probabilities.hasTypo
    title = `${title.substring(
      0,
      uniformRandom * title.length + 1
    )}${randomCharacter(
      'abcdefghijklmnop',
      getRandom('typo')
    )}${title.substring(uniformRandom * title.length + 2)}`
  }

  const hasSubtitle = getRandom('hasSubtitle') < probabilities.hasSubtitle
  let subtitle = hasSubtitle
    ? subtitleParts.filter((p) => p !== undefined).join(' ')
    : ''
  if (subtitlePunctuation)
    subtitle = `${subtitle}${getRandomPart(
      'punctuation',
      getRandom('subtitlePunctuation') ** 4
    )}`

  return {
    id,
    title,
    subtitle,
    ...typedData,
  }
}

export function generatePosts(seed: string) {
  const getSeededRandom = (key: string) => seedrandom(`${seed}-${key}`)()
  const numPosts =
    MIN_FAKE_POSTS + getSeededRandom('num') * (MAX_FAKE_POSTS - MIN_FAKE_POSTS)

  const outPosts: (PostData & { id: string })[] = []
  for (let i = 0; i < numPosts; i += 1) {
    const getSeededPost = (key: string) => getSeededRandom(`${i}-${key}`)
    outPosts.push(generatePost(getSeededPost))
  }

  return outPosts
}
