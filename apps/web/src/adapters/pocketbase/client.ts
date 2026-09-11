import PocketBase from 'pocketbase'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8090'

export const pb = new PocketBase(baseUrl)

pb.autoCancellation(false)

export const journUrl = (path: string): string => `${baseUrl}/api/journ${path}`
