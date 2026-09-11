import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { Ticket } from '_/core/domain/ticket'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { TicketFilter } from '_/core/ports/tickets'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type TicketsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly tickets: readonly Ticket[] }
	| { readonly status: 'failed'; readonly message: string }

export const useTickets = (project: string, filter?: TicketFilter): TicketsState => {
	const { tickets } = useContainer()
	const [state, setState] = useState<TicketsState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await tickets.list(project, JSON.parse(key) as TicketFilter)

		setState(
			result.success
				? { status: 'ready', tickets: result.value }
				: { status: 'failed', message: result.error.message },
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

		const update = (ticket: Ticket, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, tickets: foldUpdates(current.tickets, ticket, action) } : current,
			)
		}

		void subscribe(tickets.subscribeToList(project, update, JSON.parse(key) as TicketFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, tickets])

	return state
}
