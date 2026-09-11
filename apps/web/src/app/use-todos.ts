import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { Todo } from '_/core/domain/todo'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { TodoFilter } from '_/core/ports/todos'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type TodosState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly todos: readonly Todo[] }
	| { readonly status: 'failed'; readonly message: string }

let unsubscribes: Unsubscribe[] = []

const subscribe = async (open: Promise<Result<Unsubscribe>>, cancelled: boolean) => {
	const result = await open
	if (!result.success) {
		return
	}
	if (cancelled) {
		void result.value().catch(noop)
		return
	}
	unsubscribes.push(result.value)
}

let cancelled = false

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

	const update = useEffectEvent((todo: Todo, action: ActionEvent) => {
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
	})

	useEffect(() => {
		load()
	}, [])

	useEffect(() => {
		subscribe(todos.subscribeToList(project, update, JSON.parse(key) as TodoFilter), cancelled)

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
			unsubscribes = []
		}
	}, [project, key, todos])

	return state
}
