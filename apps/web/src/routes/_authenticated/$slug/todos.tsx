import { createFileRoute } from '@tanstack/react-router'
import { TODO_STATUSES, PRIORITIES, type Priority, type TodoStatus } from '_/core/domain/todo'
import { Todos } from '_/pages/todos'

export type TodosSearch = {
	readonly todo?: string
	readonly ticket?: string
	readonly statuses?: readonly TodoStatus[]
	readonly priority?: Priority
	readonly tags?: readonly string[]
	readonly q?: string
}

const asString = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined)

const asMember = <T extends string>(allowed: readonly T[], value: unknown): T | undefined =>
	allowed.includes(value as T) ? (value as T) : undefined

// Search params arrive as unknown from the URL, so each is narrowed to the
// domain's own union rather than trusted. An unparseable value is dropped
// instead of throwing, so a hand-edited URL degrades to a wider list.
const asMembers = <T extends string>(allowed: readonly T[], value: unknown): readonly T[] | undefined => {
	const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
	const parsed = raw.map(entry => asMember(allowed, entry)).filter((entry): entry is T => entry !== undefined)

	return parsed.length > 0 ? parsed : undefined
}

const asStrings = (value: unknown): readonly string[] | undefined => {
	const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
	const parsed = raw.map(asString).filter((entry): entry is string => entry !== undefined)

	return parsed.length > 0 ? parsed : undefined
}

export const Route = createFileRoute('/_authenticated/$slug/todos')({
	validateSearch: (search: Record<string, unknown>): TodosSearch => ({
		todo: asString(search.todo),
		ticket: asString(search.ticket),
		statuses: asMembers(TODO_STATUSES, search.statuses),
		priority: asMember(PRIORITIES, search.priority),
		tags: asStrings(search.tags),
		q: asString(search.q),
	}),
	component: Todos,
})
