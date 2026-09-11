import type { Todo } from '_/core/domain/todo'
import type { TodoFilter } from '_/core/ports/todos'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

type TodosState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly todos: readonly Todo[] }
	| { readonly status: 'failed'; readonly message: string }

export const useTodos = (project: string, filter?: TodoFilter): TodosState => {
	const { todos } = useContainer()
	const [state, setState] = useState<TodosState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await todos.list(project, JSON.parse(key) as TodoFilter)

		if (!result.success) {
			setState({
				status: 'failed',
				message: result.error instanceof Error ? result.error.message : 'Could not load todos',
			})
		} else {
			setState({ status: 'ready', todos: result.value })
		}
	})

	useEffect(() => {
		load()
	}, [])

	return state
}
