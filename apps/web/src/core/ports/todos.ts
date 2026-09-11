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
	readonly list: (project: string, filter?: TodoFilter) => Promise<readonly Todo[]>
}
