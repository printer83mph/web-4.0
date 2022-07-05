import * as trpc from '@trpc/client'

import { TRPC_URL } from './constants'

import type { Router } from '$lib/trpc-server'

export default trpc.createTRPCClient<Router>({ url: TRPC_URL })
