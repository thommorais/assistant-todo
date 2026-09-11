import type { Ticket } from '_/core/domain/ticket'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

type TicketState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly ticket: Ticket }
	| { readonly status: 'failed'; readonly message: string }

// A single ticket is addressed by its project-scoped slug, the same way the
// CLI and the API address one.
export const useTicket = (project: string, slug: string): TicketState => {
	const { tickets } = useContainer()
	const [state, setState] = useState<TicketState>({ status: 'loading' })

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await tickets.get(project, slug)

		setState(
			result.success ? { status: 'ready', ticket: result.value } : { status: 'failed', message: result.error.message },
		)
	})

	useEffect(() => {
		load()
	}, [project, slug])

	return state
}
