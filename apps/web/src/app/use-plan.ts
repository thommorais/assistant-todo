import type { Plan } from '_/core/domain/plan'
import { useEffect, useEffectEvent, useState } from 'react'
import { useContainer } from './container'

type PlanState =
	| { readonly status: 'idle' }
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly plan: Plan }
	| { readonly status: 'failed'; readonly message: string }

export const usePlan = (project: string, id: string | undefined): PlanState => {
	const { plans } = useContainer()
	const [state, setState] = useState<PlanState>({ status: 'idle' })

	const load = useEffectEvent(async (planId: string) => {
		setState({ status: 'loading' })
		const result = await plans.get(project, planId)

		setState(
			result.success ? { status: 'ready', plan: result.value } : { status: 'failed', message: result.error.message },
		)
	})

	useEffect(() => {
		if (!id) {
			setState({ status: 'idle' })
			return
		}

		load(id)
	}, [project, id])

	return state
}
