<script lang="ts">
  import { createForm } from 'felte'
  import { validator } from '@felte/validator-zod'
  import { fade, slide } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import Dropzone from 'svelte-file-dropzone'

  import PostDisplay from './post-display.svelte'

  import { postSchema, type PostData, type PostWithMeta } from '$models/post'
  import trpcClient, { uploadImage } from '$lib/trpc-client'

  export let innerPost: PostData | null = null

  const dispatch = createEventDispatcher<{ submit: PostWithMeta }>()

  const { form, data, isSubmitting, setFields, isValid, errors, touched } =
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
            try {
              const res = await fetch(values.imageUrl)
              if (!res.ok) {
                console.log(res)
                return { imageUrl: 'Image not found' }
              }
            } catch (err) {
              console.log('invalid url')
              return { imageUrl: 'Invalid URL' }
            }
          }
          console.log('all normal!')
          return { imageUrl: null }
        },
      },
    })

  const onDrop = async ({
    detail: { acceptedFiles },
  }: CustomEvent<{ acceptedFiles: File[] }>) => {
    const link = await uploadImage(acceptedFiles[0])
    setFields('imageUrl', link)
  }

  let previewWidth: number | undefined

  $: imageUrlErrors = ($errors as { imageUrl: string[] }).imageUrl

  $: showImageInput = !$data.isReply && !$data.imageUrl
  $: showPreview = $isValid
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
    <label class="input" class:error={imageUrlErrors}>
      <div class="label">Image URL</div>
      <input
        type="url"
        class="field focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="imageUrl"
      />
      {#if imageUrlErrors}
        <div class="error" transition:slide>{imageUrlErrors[0]}.</div>
      {/if}
    </label>
  {/if}
  <label class="input" class:error={$errors.title}>
    <div class="label">Primary Text</div>
    <input
      type="text"
      name="title"
      class="field focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Drugs"
    />
    {#if $errors.title}
      <div class="error" transition:slide>{$errors.title[0]}.</div>
    {/if}
  </label>
  <label class="input" class:error={$errors.subtitle}>
    <div class="label">Secondary Text</div>
    <input
      type="text"
      name="subtitle"
      class="field focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Not even once."
    />
    {#if $errors.subtitle}
      <div class="error" transition:slide>{$errors.subtitle[0]}.</div>
    {/if}
  </label>
  <button
    type="submit"
    class="btn rounded bg-blue-500 px-3 py-2 text-2xl font-medium text-white transition-[background-color,box-shadow] hover:bg-blue-600 hover:shadow-md"
    class:btn-disabled={disableSubmit}
    transition:fade|local
    disabled={disableSubmit}>Submit</button
  >
  {#if showPreview}
    <div class="mx-auto">
      <p class="mb-1 text-sm text-gray-500">Preview</p>
      <PostDisplay post={$data} width={previewWidth} />
    </div>
  {/if}
</form>

<style>
  .input {
    @apply flex flex-col;
  }
  .input .label {
    @apply mb-1 text-sm text-gray-500 transition-colors;
  }
  .input.error .label {
    @apply text-red-500;
  }
  .input .field {
    @apply rounded px-3 py-2 ring-1 ring-gray-400 transition-shadow;
  }
  .input.error .field {
    @apply ring-red-500;
  }
  .input .error {
    @apply mt-1 text-sm text-red-500;
  }
  .btn.btn-disabled {
    @apply bg-gray-500 text-gray-200;
  }
</style>
