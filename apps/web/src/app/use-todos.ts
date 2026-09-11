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

const subscribe = async (open: Promise<Result<Unsubscribe>>, signal: AbortSignal, opened: Unsubscribe[]) => {
	const result = await open
	if (!result.success) {
		return
	}
	if (signal.aborted) {
		void result.value().catch(noop)
		return
	}

	opened.push(result.value)
}

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
	}, [project, key])

	useEffect(() => {
		const controller = new AbortController()
		const opened: Unsubscribe[] = []

		void subscribe(todos.subscribeToList(project, update, JSON.parse(key) as TodoFilter), controller.signal, opened).catch(
			noop,
		)

		return () => {
			controller.abort()
			for (const close of opened) {
				void close().catch(noop)
			}
		}
	}, [project, key, todos])

	return state
}
