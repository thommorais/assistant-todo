import { sortExpr } from './sort'
import type { LogEntry } from '_/core/domain/log'
import { logId as toLogId } from '_/core/domain/log'
import { planId as toPlanId } from '_/core/domain/plan'
import { ticketId as toTicketId } from '_/core/domain/ticket'
import { projectId as toProjectId, userId as toUserId } from '_/core/domain/project'
import { todoId as toTodoId } from '_/core/domain/todo'
import type { LogFilter, LogsPort } from '_/core/ports/logs'
import type { Unsubscribe } from '_/core/ports/subscription'
import { err, ok, type Result } from '_/lib/result'
import { tryCatch } from '_/lib/try-catch'
import { Collections, type JournLogsResponse } from '_/pocketbase-types'
import type { ActionEvent } from '_/types'
import { getPocketBaseClient } from './client'
import { filterFor } from './filter-builder'
import { countRows } from './count-rows'
import { paginate } from './paginate'

type LogRecord = JournLogsResponse<unknown, string[]>

type LogColumns = {
	'project.slug': string
	title: string
	body: string
	branch: string
	ticket: string
	external_ref: string
	tags: string
	created: Date
	updated: Date
}

const message = (error: unknown): string => (error instanceof Error ? error.message : 'Unknown error')

const toLogEntry = (record: LogRecord): LogEntry => ({
	id: toLogId(record.id),
	projectId: toProjectId(record.project),
	ticketId: record.ticket ? toTicketId(record.ticket) : undefined,
	planId: record.plan ? toPlanId(record.plan) : undefined,
	todoId: record.todo ? toTodoId(record.todo) : undefined,
	title: record.title,
	body: record.body ?? '',
	branch: record.branch ?? '',
	pr: record.pr ?? '',
	externalRef: record.external_ref ?? '',
	tags: record.tags ?? [],
	createdBy: record.created_by ? toUserId(record.created_by) : undefined,
	createdAt: new Date(record.created),
	updatedAt: new Date(record.updated),
})

const columns = (project: string, filter: LogFilter) =>
	filterFor<LogColumns>()([
		{ field: 'project.slug', comparator: 'eq', value: project },
		{ field: 'ticket', comparator: 'eq', value: filter.ticketId },
		{ field: 'branch', comparator: 'eq', value: filter.branch },
		{ field: 'external_ref', comparator: 'eq', value: filter.externalRef },
		{ field: 'tags', comparator: 'containsAll', value: filter.tags },
		{ field: 'title', comparator: 'contains', value: filter.search },
		{ field: 'created', comparator: 'gte', value: filter.since },
		{ field: 'created', comparator: 'lte', value: filter.until },
	])

export const createLogsAdapter = (): LogsPort => {
	const client = getPocketBaseClient()
	const collection = client.collection(Collections.JournLogs)

	return {
		count: async (project, filter = {}): Promise<Result<number>> => {
			const { expr, params } = columns(project, filter)

			const { data, error } = await tryCatch(countRows(collection, { filter: client.filter(expr, params) }))

			return error ? err(new Error(`Failed to count logs: ${error.message}`, { cause: error })) : ok(data)
		},

		list: async (project, filter = {}): Promise<Result<readonly LogEntry[]>> => {
			const { expr, params } = columns(project, filter)

			const { data, error } = await tryCatch(
				paginate<LogRecord>(collection, filter, {
					filter: client.filter(expr, params),
					sort: sortExpr(filter.sort, '-created'),
				}),
			)

			return error
				? err(new Error(`Failed to list logs: ${error.message}`, { cause: error }))
				: ok(data.map(toLogEntry))
		},

		subscribeToList: async (project, update, filter = {}): Promise<Result<Unsubscribe>> => {
			const { expr, params } = columns(project, filter)

			try {
				const unsubscribe = await collection.subscribe<LogRecord>(
					'*',
					event => {
						update(toLogEntry(event.record), event.action as ActionEvent)
					},
					{ filter: client.filter(expr, params) },
				)

				return ok(unsubscribe)
			} catch (error) {
				return err(new Error(`Failed to subscribe to logs: ${message(error)}`))
			}
		},
	}
}
