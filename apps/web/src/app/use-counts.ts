import type { Unsubscribe } from '_/core/ports/subscription'
import type { Result } from '_/lib/result'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'
import { collectCounts, type CountsState } from './counts'

const noop = () => {}

export const useCounts = (project: string): CountsState => {
	const { docs, journal, plans, tickets, todos } = useContainer()
	const [state, setState] = useState<CountsState>({ status: 'loading' })

	const load = useEffectEvent(async () => {
		const results = await Promise.all([
			tickets.count(project),
			plans.count(project),
			todos.count(project),
			journal.count(project),
			docs.count(project),
		])

		setState(collectCounts(results))
	})

	useEffect(() => {
		setState({ status: 'loading' })
		void load()
	}, [project])

	// The tiles sit beside lists that update themselves, so a count that only
	// loaded once would drift out of step with the rows right next to it. The
	// event carries one record, not a total, so recount instead of adjusting.
	useEffect(() => {
		const closers: Unsubscribe[] = []
		let cancelled = false

		const recount = () => {
			if (!cancelled) void load()
		}

		const subscribe = async (open: Promise<Result<Unsubscribe>>) => {
			const result = await open
			if (!result.success) return
			if (cancelled) {
				void result.value().catch(noop)
				return
			}
			closers.push(result.value)
		}

		void subscribe(tickets.subscribeToList(project, recount))
		void subscribe(plans.subscribeToList(project, recount))
		void subscribe(todos.subscribeToList(project, recount))
		void subscribe(journal.subscribeToList(project, recount))
		void subscribe(docs.subscribeToList(project, recount))

		return () => {
			cancelled = true
			for (const close of closers) {
				void close().catch(noop)
			}
		}
	}, [project, tickets, plans, todos, journal, docs])

	return state
}
