import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { Todo } from '_/core/domain/todo'
import type { TodoFilter } from '_/core/ports/todos'
import { Result } from '_/lib/result'
import { ActionEvent } from '_/types'
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

	useEffect(() => {
		const unsubscribes: Array<() => void> = []
		let cancelled = false
		const subscribe = async (open: Promise<Result<() => void>>) => {
			const result = await open
			if (!result.success) {
				return
			}
			if (cancelled) {
				result.value()
				return
			}
			unsubscribes.push(result.value)
		}

		const update = (todo: Todo, action: ActionEvent) => {
			setState(curr => {
				if (curr.status === 'ready') {
					const todos = foldUpdates<Todo>(curr.todos, todo, action)
					return {
						...curr,
						todos,
					}
				}
				return curr
			})
		}

		subscribe(todos.subscribeToList(project, update, JSON.parse(key) as TodoFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				close()
			}
			setState({ status: 'loading' })
		}
	}, [project, key, todos])

	return state
}
