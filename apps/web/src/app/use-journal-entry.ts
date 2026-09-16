import type { JournalEntry } from '_/core/domain/journal'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

type JournalEntryState =
	| { readonly status: 'idle' }
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly entry: JournalEntry }
	| { readonly status: 'failed'; readonly message: string }

export const useJournalEntry = (project: string, slug: string): JournalEntryState => {
	const { journal } = useContainer()
	const [state, setState] = useState<JournalEntryState>({ status: 'idle' })

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await journal.get(project, slug)

		setState(
			result.success ? { status: 'ready', entry: result.value } : { status: 'failed', message: result.error.message },
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
