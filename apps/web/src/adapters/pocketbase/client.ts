import { TypedPocketBase } from '_/pocketbase-types'
import PocketBase from 'pocketbase'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8090'

let browserClient: TypedPocketBase | undefined

const createPocketBaseClient = (): TypedPocketBase => {
	const pb = new PocketBase(baseUrl) as TypedPocketBase

	if (import.meta.env.DEV) {
		pb.autoCancellation(false)
	}

	return pb
}

const getPocketBaseClient = (): TypedPocketBase => {
	// Client-side: reuse singleton
	if (!browserClient) {
		browserClient = createPocketBaseClient()
	}

	return browserClient
}

const journUrl = (path: string): string => `${baseUrl}/api/journ${path}`

export { journUrl, getPocketBaseClient }
