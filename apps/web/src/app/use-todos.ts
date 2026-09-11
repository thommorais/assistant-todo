import { useCallback, useEffect, useState } from 'react'
import type { Todo } from '_/core/domain/todo'
import type { TodoFilter } from '_/core/ports/todos'
import { useContainer } from './container'

type TodosState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly todos: readonly Todo[] }
	| { readonly status: 'failed'; readonly message: string }

export const useTodos = (project: string, filter?: TodoFilter): TodosState => {
	const { todos } = useContainer()
	const [state, setState] = useState<TodosState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useCallback(async () => {
		setState({ status: 'loading' })
		try {
			const result = await todos.list(project, JSON.parse(key) as TodoFilter)
			setState({ status: 'ready', todos: result })
		} catch (cause) {
			setState({ status: 'failed', message: cause instanceof Error ? cause.message : 'Could not load todos' })
		}
	}, [todos, project, key])

	useEffect(() => {
		void load()
	}, [load])

	return state
}
