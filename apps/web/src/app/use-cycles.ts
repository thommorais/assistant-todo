import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { Cycle } from '_/core/domain/cycle'
import type { CycleFilter } from '_/core/ports/cycles'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type CyclesState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly cycles: readonly Cycle[] }
	| { readonly status: 'failed'; readonly message: string }

export const useCycles = (project: string, filter?: CycleFilter): CyclesState => {
	const { cycles } = useContainer()
	const [state, setState] = useState<CyclesState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await cycles.list(project, JSON.parse(key) as CycleFilter)

		setState(
			result.success
				? { status: 'ready', cycles: result.value }
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

		const update = (cycle: Cycle, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, cycles: foldUpdates(current.cycles, cycle, action) } : current,
			)
		}

		void subscribe(cycles.subscribeToList(project, update, JSON.parse(key) as CycleFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, cycles])

	return state
}
