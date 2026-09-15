import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { JournalEntry } from '_/core/domain/journal'
import type { JournalFilter } from '_/core/ports/journal'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type LogsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly journal: readonly JournalEntry[] }
	| { readonly status: 'failed'; readonly message: string }

export const useJournal = (project: string, filter?: JournalFilter): LogsState => {
	const { journal } = useContainer()
	const [state, setState] = useState<LogsState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await journal.list(project, JSON.parse(key) as JournalFilter)

		setState(
			result.success ? { status: 'ready', journal: result.value } : { status: 'failed', message: result.error.message },
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

		const update = (entry: JournalEntry, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, journal: foldUpdates(current.journal, entry, action) } : current,
			)
		}

		void subscribe(journal.subscribeToList(project, update, JSON.parse(key) as JournalFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, journal])

	return state
}
