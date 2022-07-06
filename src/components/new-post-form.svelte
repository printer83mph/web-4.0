<script lang="ts">
  import { createForm } from 'felte'
  import { validator } from '@felte/validator-zod'
  import { blur, fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import Dropzone from 'svelte-file-dropzone'

  import PostDisplay from './post-display.svelte'

  import { postSchema, type PostData, type PostWithMeta } from '$models/post'
  import trpcClient, { uploadImage } from '$lib/trpc-client'

  export let innerPost: PostData | null = null

  const dispatch = createEventDispatcher<{ submit: PostWithMeta }>()

  const { form, data, isSubmitting, setData } = createForm<PostData>({
    async onSubmit(values) {
      const newPost = await trpcClient.mutation('new-post', values)
      dispatch('submit', newPost)
    },
    initialValues: {
      title: '',
      subtitle: '',
      isReply: !!innerPost,
      innerPost: innerPost || undefined,
      imageUrl: innerPost ? undefined : '',
    },
    transform: (values) => ({
      ...(values as PostData),
      title: (values as PostData).title.toUpperCase(),
    }),
    extend: validator({ schema: postSchema }),
  })

  const onDrop = async ({
    detail: { acceptedFiles },
  }: CustomEvent<{ acceptedFiles: File[] }>) => {
    const link = await uploadImage(acceptedFiles[0])
    setData('imageUrl', link)
  }

  let previewWidth: number | undefined

  $: showImageInput = !$data.isReply && !$data.imageUrl
  $: showPreview = previewWidth && ($data.isReply || $data.imageUrl)
</script>

{#if showImageInput}
  <Dropzone on:drop={onDrop} accept="image/*" />
{/if}
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
      class="rounded px-3 py-2 ring-1 ring-gray-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="DRUGS"
    />
  </label>
  <label class="flex flex-col">
    <div class="mb-1 text-sm text-gray-500">Secondary Text</div>
    <input
      type="text"
      name="subtitle"
      class="rounded px-3 py-2 ring-1 ring-gray-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Not even once."
    />
  </label>
  {#if showPreview}
    <div class="mx-auto" transition:blur|local>
      <p class="mb-1 text-sm text-gray-500">Preview</p>
      <PostDisplay post={$data} width={previewWidth} />
    </div>
    <button
      type="submit"
      class="btn rounded bg-blue-500 px-3 py-2 text-2xl font-medium text-white transition-[background-color,box-shadow] hover:bg-blue-600 hover:shadow-md"
      class:btn-disabled={$isSubmitting}
      transition:fade|local
      disabled={$isSubmitting}>Submit</button
    >
  {/if}
</form>

<style>
  .btn.btn-disabled {
    @apply bg-gray-500 text-gray-800;
  }
</style>
