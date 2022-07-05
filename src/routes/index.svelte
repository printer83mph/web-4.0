<script lang="ts">
  import type { Post } from '$lib/types'
  import PostDisplay from '$components/post-display.svelte'

  let width = 800
  let title = 'DETERMINATION'
  let subtitle = "Just because you tried doesn't mean it was worth it"

  $: post = {
    title,
    subtitle,
    reply: false,
    imageUrl: 'http://placekitten.com/500/300',
  } as Post
</script>

<div class="container mx-auto">
  <div class="flex flex-col">
    <input type="range" bind:value={width} min={100} max={1000} />
    <input type="text" bind:value={title} />
    <input type="text" bind:value={subtitle} />
  </div>

  <PostDisplay {width} {post} />
  <br />
  <PostDisplay
    {width}
    post={{
      reply: true,
      innerPost: post,
      title: 'REPLY THING',
      subtitle: 'He He He Haw',
    }}
  />
  <br />
  <PostDisplay
    {width}
    post={{
      reply: true,
      innerPost: {
        reply: true,
        innerPost: post,
        title: 'REPLY THING',
        subtitle: 'He He He Haw',
      },
      title: 'HEHEHAW',
      subtitle: 'You Will Not Believe This',
    }}
  />
</div>
