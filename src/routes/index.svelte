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
  import { generatePosts, type PostData, type PostWithMeta } from '$models/post'
  import NewPostForm from '$components/new-post-form.svelte'
  import inView from '$actions/in-view'

  let containerWidth: number | undefined

  // newest last
  let onlinePosts: PostWithMeta[]
  let lastPostDate = new Date()

  // newest first!
  let displayPosts: (PostData & { id: string })[]

  async function fetchData() {
    const oneMonthBack = new Date(lastPostDate)
    oneMonthBack.setDate(oneMonthBack.getDate() - 30)
    const posts = await trpcClient.query('posts', {
      from: oneMonthBack.getTime(),
      to: lastPostDate.getTime(),
    })
    if (!onlinePosts) onlinePosts = []
    onlinePosts.push(...posts)
    onlinePosts = onlinePosts
    lastPostDate = oneMonthBack
  }

  async function addPostWithFakes(opts: { top?: boolean } = {}) {
    if (displayPosts === undefined) displayPosts = []
    if (onlinePosts.length === 0) return
    // we have this if statement.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const latestPost = onlinePosts.pop()!
    onlinePosts = onlinePosts
    const posts = [latestPost, ...generatePosts(latestPost.id)]
    if (opts.top) displayPosts.unshift(...posts)
    else displayPosts.push(...posts)
    displayPosts = displayPosts
  }

  let loadingOnlinePosts = true
  async function loadContent(evt: CustomEvent<boolean>) {
    if (!evt.detail) return
    loadingOnlinePosts = true
    if (onlinePosts.length === 0) {
      displayPosts.push(...generatePosts(Math.random().toString()))
      displayPosts = displayPosts
    } else {
      addPostWithFakes()
      if (onlinePosts.length === 0) {
        await fetchData()
      }
    }
    loadingOnlinePosts = false
  }

  // Dialog state management
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
    onlinePosts.push(post.detail)
    onlinePosts = onlinePosts
    addPostWithFakes({ top: true })
    closeDialog()
  }

  onMount(async () => {
    await fetchData()
    loadingOnlinePosts = false
    addPostWithFakes()
    addPostWithFakes()
    addPostWithFakes()
  })
</script>

<svelte:head>
  <title>Browse the Internet | Web 4.0</title>
</svelte:head>

<main class="mx-auto lg:max-w-5xl" bind:clientWidth={containerWidth}>
  <nav class="sticky top-0 z-10 flex select-none bg-white py-3 px-4 lg:px-0">
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
  </nav>
  {#if displayPosts && containerWidth}
    <ul class="relative flex flex-col gap-6 pb-6" in:fade={{ duration: 300 }}>
      {#each displayPosts as post}
        <li class="flex flex-col">
          <PostDisplay {post} width={containerWidth} />
          <div class="mt-1 flex items-center px-2 text-gray-500 lg:px-0">
            <button
              type="button"
              class="ml-auto flex select-none items-center gap-2 rounded px-3 py-2 transition-[color,box-shadow] hover:text-black hover:shadow-md"
              on:click={() => openDialog(post)}
              ><CornerUpLeftIcon />Reply</button
            >
          </div>
        </li>
      {/each}
      {#if !loadingOnlinePosts}
        <div use:inView on:inview={loadContent} class="h-20" />
      {:else}
        <div>Loading...</div>
      {/if}
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
        <div class="flex h-full w-full items-start justify-center">
          <!-- actual panel -->
          <div
            class="relative flex w-full max-w-xl flex-col gap-4 rounded-md bg-white p-4"
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
