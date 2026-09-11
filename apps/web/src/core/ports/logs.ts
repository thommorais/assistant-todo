import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import type { LogEntry } from '../domain/log'
import type { Unsubscribe } from './subscription'

export type LogFilter = {
	readonly branch?: string
	readonly ticket?: string
	readonly tags?: readonly string[]
	readonly search?: string
	readonly since?: Date
	readonly until?: Date
	readonly limit?: number
	readonly offset?: number
}

export type LogsPort = {
	readonly list: (project: string, filter?: LogFilter) => Promise<Result<ReadonlyArray<LogEntry>>>
	readonly subscribeToList: (
		project: string,
		update: (entry: LogEntry, action: ActionEvent) => void,
		filter?: LogFilter,
	) => Promise<Result<Unsubscribe>>
}
