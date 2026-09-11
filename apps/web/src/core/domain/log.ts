import type { Branded } from './branded'
import type { PlanId } from './plan'
import type { ProjectId, UserId } from './project'
import type { TodoId } from './todo'

export type LogId = Branded<string, 'LogId'>

export const logId = (value: string): LogId => value as LogId

export type LogEntry = {
	readonly id: LogId
	readonly projectId: ProjectId
	readonly planId: PlanId | undefined
	readonly todoId: TodoId | undefined
	readonly title: string
	readonly body: string
	readonly branch: string
	readonly pr: string
	readonly ticket: string
	readonly tags: readonly string[]
	readonly createdBy: UserId | undefined
	readonly createdAt: Date
	readonly updatedAt: Date
}
