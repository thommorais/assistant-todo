import type { Doc } from '_/core/domain/doc'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

type DocState =
	| { readonly status: 'idle' }
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly doc: Doc }
	| { readonly status: 'failed'; readonly message: string }

export const useDoc = (project: string, slug: string): DocState => {
	const { docs } = useContainer()
	const [state, setState] = useState<DocState>({ status: 'idle' })

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await docs.get(project, slug)

		setState(
			result.success ? { status: 'ready', doc: result.value } : { status: 'failed', message: result.error.message },
		)
	})

	useEffect(() => {
		if (!slug) {
			setState({ status: 'idle' })
			return
		}

		load()
	}, [project, slug])

	return state
}
