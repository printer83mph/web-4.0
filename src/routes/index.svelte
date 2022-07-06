<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import {
    XIcon,
    CornerUpLeftIcon,
    GlobeIcon,
    PlusIcon,
    LoaderIcon,
  } from 'svelte-feather-icons'

  import PostDisplay from '$components/post-display.svelte'
  import trpcClient from '$lib/trpc-client'
  import type { PostData, PostWithMeta } from '$models/post'
  import NewPostForm from '$components/new-post-form.svelte'

  let containerWidth: number | undefined

  let postsList: PostWithMeta[]

  async function fetchData() {
    postsList = (await trpcClient.query('posts')).reverse()
  }

  let dialog: { open: boolean; innerPost: PostData | null } = {
    open: false,
    innerPost: null,
  }

  function openDialog(innerPost: PostData | null = null) {
    dialog = { open: true, innerPost }
  }

  function closeDialog() {
    dialog = { open: false, innerPost: null }
  }

  function onNewPost(post: CustomEvent<PostWithMeta>) {
    console.log('pushing new post')
    postsList.unshift(post.detail)
    postsList = postsList
    closeDialog()
  }

  onMount(fetchData)
</script>

<main class="mx-auto lg:max-w-5xl" bind:clientWidth={containerWidth}>
  <div class="sticky top-0 z-10 flex bg-white py-3 px-4 lg:px-0">
    <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
      <GlobeIcon /> Web 4.0
    </h1>
    <button
      type="button"
      on:click={() => openDialog()}
      class="ml-auto flex items-center gap-2 rounded px-3 py-2 text-gray-500 transition-[color,background-color,box-shadow] hover:bg-blue-500 hover:text-white hover:shadow-md"
    >
      <PlusIcon /> New Post
    </button>
  </div>
  {#if postsList && containerWidth}
    <ul class="relative flex flex-col gap-6 pb-6">
      {#each postsList as post}
        <div class="flex flex-col" in:fade={{ duration: 150 }}>
          <PostDisplay {post} width={containerWidth} />
          <div class="mt-1 flex items-center px-2 text-gray-500 lg:px-0">
            <button
              type="button"
              class="ml-auto flex items-center gap-2 rounded px-3 py-2 transition-[color,box-shadow] hover:text-black hover:shadow-md"
              on:click={() => openDialog(post)}
              ><CornerUpLeftIcon />Reply</button
            >
          </div>
        </div>
      {/each}
    </ul>
  {:else}
    <div
      class="flex h-40 items-center justify-center gap-2 text-gray-500"
      in:fade={{ delay: 700, duration: 500 }}
    >
      <LoaderIcon />
      Loading...
    </div>
  {/if}
  {#if dialog.open}
    <div class="relative z-50">
      <!-- panel -->
      <div class="fixed inset-0 flex overflow-auto p-2">
        <!-- backdrop -->
        <div
          class="fixed inset-0 bg-black/50"
          in:fade={{ duration: 300 }}
          out:fade={{ duration: 200 }}
          on:click={closeDialog}
          aria-hidden="true"
        />
        <!-- centering container -->
        <div
          class="flex h-full w-full items-start justify-center lg:items-center"
        >
          <!-- actual panel -->
          <div
            class="relative flex w-full max-w-lg flex-col gap-4 rounded-md bg-white p-4"
            in:fly={{ y: 50, easing: cubicOut, duration: 300 }}
            out:fade={{ duration: 200 }}
          >
            <div class="flex items-center">
              <h3 class="text-3xl font-bold tracking-tight">
                {#if dialog.innerPost}
                  Replying to Post
                {:else}
                  New Post
                {/if}
              </h3>
              <button
                type="button"
                on:click={closeDialog}
                class="ml-auto p-1 text-lg"><XIcon /></button
              >
            </div>
            <NewPostForm innerPost={dialog.innerPost} on:submit={onNewPost} />
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>
