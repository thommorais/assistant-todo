import type { Todo } from '_/core/domain/todo'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

type TodoState =
	| { readonly status: 'idle' }
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly todo: Todo }
	| { readonly status: 'failed'; readonly message: string }

export const useTodo = (project: string, id: string | undefined): TodoState => {
	const { todos } = useContainer()
	const [state, setState] = useState<TodoState>({ status: 'idle' })

	const load = useEffectEvent(async (todoId: string) => {
		setState({ status: 'loading' })
		const result = await todos.get(project, todoId)

		setState(
			result.success ? { status: 'ready', todo: result.value } : { status: 'failed', message: result.error.message },
		)
	})

	useEffect(() => {
		if (!id) {
			setState({ status: 'idle' })
			return
		}

		load(id)
	}, [project, id])

	return state
}
