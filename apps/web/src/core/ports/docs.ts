import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import type { Doc } from '../domain/doc'
import type { Unsubscribe } from './subscription'

export type DocFilter = {
	readonly tags?: readonly string[]
	readonly search?: string
	readonly limit?: number
	readonly offset?: number
}

export type DocsPort = {
	readonly list: (project: string, filter?: DocFilter) => Promise<Result<ReadonlyArray<Doc>>>
	readonly subscribeToList: (
		project: string,
		update: (doc: Doc, action: ActionEvent) => void,
		filter?: DocFilter,
	) => Promise<Result<Unsubscribe>>
}
