import type { Result } from '_/lib/result'
import type { Unsubscribe } from './subscription'
import type { ActionEvent } from '_/types'
import type { Priority, Todo, TodoStatus } from '../domain/todo'

export type TodoFilter = {
	readonly status?: readonly TodoStatus[]
	readonly priority?: Priority
	readonly tags?: readonly string[]
	readonly search?: string
	readonly limit?: number
	readonly offset?: number
}

export type TodosPort = {
	readonly list: (project: string, filter?: TodoFilter) => Promise<Result<ReadonlyArray<Todo>>>
	readonly subscribeToList: (
		project: string,
		update: (todo: Todo, action: ActionEvent) => void,
		filter?: TodoFilter,
	) => Promise<Result<Unsubscribe>>
}
