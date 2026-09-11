import type { ProjectId, UserId } from './project'

declare const brand: unique symbol

type Branded<T, B extends string> = T & { readonly [brand]: B }

export type PlanId = Branded<string, 'PlanId'>

export const planId = (value: string): PlanId => value as PlanId

export const PLAN_STATUSES = ['draft', 'active', 'done', 'abandoned'] as const

export type PlanStatus = (typeof PLAN_STATUSES)[number]

export type Plan = {
	readonly id: PlanId
	readonly projectId: ProjectId
	readonly title: string
	readonly goal: string
	readonly status: PlanStatus
	readonly tags: readonly string[]
	readonly createdBy: UserId | undefined
	readonly createdAt: Date
	readonly updatedAt: Date
}

export const isTerminal = (status: PlanStatus): boolean => status === 'done' || status === 'abandoned'
