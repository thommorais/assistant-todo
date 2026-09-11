import type { Result } from '_/lib/result'

export const entities = ['plans', 'todos', 'logs', 'docs'] as const

export type Entity = (typeof entities)[number]

export type Counts = Readonly<Record<Entity, number>>

export type CountsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly counts: Counts }
	| { readonly status: 'failed'; readonly message: string }

// A partial row would show a stale tile beside a fresh one with nothing to
// tell them apart, so one failed count fails all four.
export const collectCounts = (results: readonly Result<number>[]): CountsState => {
	const totals: number[] = []

	for (const result of results) {
		if (!result.success) {
			return { status: 'failed', message: result.error.message }
		}
		totals.push(result.value)
	}

	const [plans = 0, todos = 0, logs = 0, docs = 0] = totals

	return { status: 'ready', counts: { plans, todos, logs, docs } }
}
