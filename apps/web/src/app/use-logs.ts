import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { LogEntry } from '_/core/domain/log'
import type { LogFilter } from '_/core/ports/logs'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type LogsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly logs: readonly LogEntry[] }
	| { readonly status: 'failed'; readonly message: string }

export const useLogs = (project: string, filter?: LogFilter): LogsState => {
	const { logs } = useContainer()
	const [state, setState] = useState<LogsState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await logs.list(project, JSON.parse(key) as LogFilter)

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

		const update = (entry: LogEntry, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, logs: foldUpdates(current.logs, entry, action) } : current,
			)
		}

		void subscribe(logs.subscribeToList(project, update, JSON.parse(key) as LogFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, logs])

	return state
}
