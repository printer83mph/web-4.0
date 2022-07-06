<script lang="ts">
  import type { PostData } from '$models/post'

  export let post: PostData
  export let width: number
</script>

<div
  class="post-container relative flex select-none flex-col items-center overflow-hidden bg-black text-center font-serif text-white"
  style:--width={`${width}px`}
>
  <div class="img-container p-[.5%]" class:limit-height={!post.isReply}>
    {#if post.isReply}
      <svelte:self post={post.innerPost} width={width * 0.65} />
    {:else}
      <img src={post.imageUrl} alt={post.title} class="h-full" />
    {/if}
  </div>
  <h3 class="title uppercase leading-[100%] tracking-wide">{post.title}</h3>
  <p class="subtitle leading-[150%]">{post.subtitle}</p>
</div>

<style>
  .post-container {
    padding: calc(var(--width) * 0.04);
    width: var(--width);
  }
  .img-container {
    max-width: 100%;
    overflow: hidden;
    border: calc(var(--width) * 0.002) solid white;
  }
  .img-container.limit-height {
    height: calc(var(--width) * 0.4);
  }
  .title {
    font-size: calc(var(--width) * 0.07);
    margin-top: calc(var(--width) * 0.03);
  }
  .subtitle {
    font-size: calc(var(--width) * 0.02);
    margin-top: calc(var(--width) * 0.015);
  }
</style>
