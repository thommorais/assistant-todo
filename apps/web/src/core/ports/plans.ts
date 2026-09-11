import type { Result } from '_/lib/result'
import type { ActionEvent } from '_/types'
import type { Plan, PlanStatus } from '../domain/plan'
import type { Unsubscribe } from './subscription'

export type PlanFilter = {
	readonly status?: readonly PlanStatus[]
	readonly tags?: readonly string[]
	readonly search?: string
	readonly limit?: number
	readonly offset?: number
}

export type PlansPort = {
	readonly count: (project: string, filter?: PlanFilter) => Promise<Result<number>>
	readonly list: (project: string, filter?: PlanFilter) => Promise<Result<ReadonlyArray<Plan>>>
	readonly subscribeToList: (
		project: string,
		update: (plan: Plan, action: ActionEvent) => void,
		filter?: PlanFilter,
	) => Promise<Result<Unsubscribe>>
}
