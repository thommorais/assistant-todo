import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { TicketLog } from '_/core/domain/worklog'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { TicketLogFilter } from '_/core/ports/worklogs'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type TicketLogsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly logs: readonly TicketLog[] }
	| { readonly status: 'failed'; readonly message: string }

export const useTicketLogs = (project: string, filter?: TicketLogFilter): TicketLogsState => {
	const { workLogs } = useContainer()
	const [state, setState] = useState<TicketLogsState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await workLogs.listTicketLogs(project, JSON.parse(key) as TicketLogFilter)

		setState(
			result.success ? { status: 'ready', logs: result.value } : { status: 'failed', message: result.error.message },
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

		const update = (entry: TicketLog, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, logs: foldUpdates(current.logs, entry, action) } : current,
			)
		}

		void subscribe(workLogs.subscribeToTicketLogs(project, update, JSON.parse(key) as TicketLogFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, workLogs])

	return state
}
