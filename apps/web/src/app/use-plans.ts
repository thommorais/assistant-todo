import { foldUpdates } from '_/adapters/pocketbase/fold-updates'
import type { Plan } from '_/core/domain/plan'
import type { PlanFilter } from '_/core/ports/plans'
import type { Unsubscribe } from '_/core/ports/subscription'
import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

const noop = () => {}

type PlansState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly plans: readonly Plan[] }
	| { readonly status: 'failed'; readonly message: string }

export const usePlans = (project: string, filter?: PlanFilter): PlansState => {
	const { plans } = useContainer()
	const [state, setState] = useState<PlansState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useEffectEvent(async () => {
		setState({ status: 'loading' })
		const result = await plans.list(project, JSON.parse(key) as PlanFilter)

		setState(
			result.success ? { status: 'ready', plans: result.value } : { status: 'failed', message: result.error.message },
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

		const update = (plan: Plan, action: ActionEvent) => {
			setState(current =>
				current.status === 'ready' ? { ...current, plans: foldUpdates(current.plans, plan, action) } : current,
			)
		}

		void subscribe(plans.subscribeToList(project, update, JSON.parse(key) as PlanFilter))

		return () => {
			cancelled = true
			for (const close of unsubscribes) {
				void close().catch(noop)
			}
		}
	}, [project, key, plans])

	return state
}
