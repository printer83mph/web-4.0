<script lang="ts">
  import { createForm } from 'felte'
  import { validator } from '@felte/validator-zod'
  import { blur, scale } from 'svelte/transition'

  import PostDisplay from './post-display.svelte'

  import { POST_SCHEMA } from '$lib/constants'
  import type { Post } from '$lib/types'
  import trpcClient from '$lib/trpc-client'

  export let innerPost: Post | null = null

  const { form, data, isSubmitting } = createForm<Post>({
    onSubmit: async (values) => {
      await trpcClient.mutation('new-post', values)
    },
    initialValues: {
      title: '',
      subtitle: '',
      reply: !!innerPost,
      innerPost: innerPost || undefined,
      imageUrl: innerPost ? undefined : '',
    },
    transform: (values) => ({
      ...(values as Post),
      title: (values as Post).title.toUpperCase(),
      imageUrl: 'http://placekitten.com/500/300',
    }),
    extend: validator({ schema: POST_SCHEMA }),
  })

  let previewWidth = 375

  $: showPreview = $data.reply || $data.imageUrl
</script>

<form
  use:form
  class="flex flex-col gap-6 text-lg"
  bind:clientWidth={previewWidth}
>
  <label class="flex flex-col">
    <div class="mb-1 text-sm text-gray-500">Primary Text</div>
    <input
      type="text"
      name="title"
      class="rounded p-2 ring-1 ring-gray-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="DRUGS"
    />
  </label>
  <label class="flex flex-col">
    <div class="mb-1 text-sm text-gray-500">Secondary Text</div>
    <input
      type="text"
      name="subtitle"
      class="rounded p-2 ring-1 ring-gray-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Not even once."
    />
  </label>
  {#if showPreview}
    <div class="mx-auto" transition:blur>
      <PostDisplay
        post={{ ...$data, title: $data.title.toUpperCase() }}
        width={previewWidth}
      />
    </div>
    <button
      type="submit"
      class="mx-auto rounded bg-blue-500 px-3 py-2 text-2xl font-medium text-white"
      transition:scale
      disabled={$isSubmitting}>Submit</button
    >
  {/if}
</form>
