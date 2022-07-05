type ImagePostFields = {
  reply: false
  imageUrl: string
}

type ReplyPostFields = {
  reply: true
  innerPost: Post
}

export type Post = {
  title: string
  subtitle: string
} & (ImagePostFields | ReplyPostFields)
