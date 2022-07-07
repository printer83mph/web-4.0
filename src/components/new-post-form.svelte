<script lang="ts">
  import { createForm } from 'felte'
  import { validator } from '@felte/validator-zod'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import Dropzone from 'svelte-file-dropzone'

  import PostDisplay from './post-display.svelte'

  import { postSchema, type PostData, type PostWithMeta } from '$models/post'
  import trpcClient, { uploadImage } from '$lib/trpc-client'

  export let innerPost: PostData | null = null

  const dispatch = createEventDispatcher<{ submit: PostWithMeta }>()

  const { form, data, isSubmitting, setData, isValid, errors } =
    createForm<PostData>({
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
      debounced: {
        timeout: 300,
        async validate(values) {
          if (!values.isReply) {
            const res = await fetch(values.imageUrl)
            if (!res.ok) {
              return { imageUrl: 'Image not found' }
            }
          }
          return {}
        },
      },
    })

  const onDrop = async ({
    detail: { acceptedFiles },
  }: CustomEvent<{ acceptedFiles: File[] }>) => {
    const link = await uploadImage(acceptedFiles[0])
    setData('imageUrl', link)
  }

  let previewWidth: number | undefined

  $: showImageInput = !$data.isReply && !$data.imageUrl
  $: disableSubmit = $isSubmitting || !$isValid
</script>

{#if showImageInput}
  <Dropzone on:drop={onDrop} accept="image/*" />
{/if}
<form
  use:form
  class="flex flex-col gap-6 text-lg"
  bind:clientWidth={previewWidth}
>
  {#if !$data.isReply}
    <label class="flex flex-col">
      <div class="mb-1 text-sm text-gray-500">Image URL</div>
      <input
        type="url"
        class="rounded px-3 py-2 ring-1 ring-gray-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        bind:value={$data.imageUrl}
      />
    </label>
  {/if}
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
  <button
    type="submit"
    class="btn rounded bg-blue-500 px-3 py-2 text-2xl font-medium text-white transition-[background-color,box-shadow] hover:bg-blue-600 hover:shadow-md"
    class:btn-disabled={disableSubmit}
    transition:fade|local
    disabled={disableSubmit}>Submit</button
  >
  {#if $isValid}
    <div class="mx-auto">
      <p class="mb-1 text-sm text-gray-500">Preview</p>
      <PostDisplay post={$data} width={previewWidth} />
    </div>
  {/if}
</form>

<style>
  .btn.btn-disabled {
    @apply bg-gray-500 text-gray-200;
  }
</style>
