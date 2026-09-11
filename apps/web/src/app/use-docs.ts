import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { Doc } from '_/core/domain/doc'
import type { DocFilter } from '_/core/ports/docs'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type DocsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly docs: readonly Doc[] }
	| { readonly status: 'failed'; readonly message: string }

export const useDocs = (project: string, filter?: DocFilter): DocsState => {
	const { docs } = useContainer()
	const [state, setState] = useState<DocsState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await docs.list(project, JSON.parse(key) as DocFilter)

		setState(
			result.success ? { status: 'ready', docs: result.value } : { status: 'failed', message: result.error.message },
		)
	})

	useEffect(() => {
		load()
	}, [project, key])

	useEffect(() => {
		const unsubscribes: Unsubscribe[] = []
		let cancelled = false

		const subscribe = async (open: Promise<Result<Unsubscribe>>) => {
			const result = await open
			if (!result.success) return
			if (cancelled) {
				void result.value().catch(noop)
				return
			}
			unsubscribes.push(result.value)
		}

		const update = (doc: Doc, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, docs: foldUpdates(current.docs, doc, action) } : current,
			)
		}

		void subscribe(docs.subscribeToList(project, update, JSON.parse(key) as DocFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, docs])

	return state
}
