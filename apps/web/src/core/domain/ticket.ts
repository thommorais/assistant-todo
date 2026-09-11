import type { Branded } from './branded'
import type { ProjectId, UserId } from './project'
import type { Priority } from './todo'

export type TicketId = Branded<string, 'TicketId'>

export const ticketId = (value: string): TicketId => value as TicketId

export const TICKET_STATUSES = ['open', 'in_progress', 'blocked', 'closed', 'cancelled'] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]

export type Ticket = {
	readonly id: TicketId
	readonly projectId: ProjectId
	readonly slug: string
	readonly title: string
	readonly body: string
	readonly status: TicketStatus
	readonly priority: Priority
	readonly assignee: UserId | undefined
	readonly tags: readonly string[]
	readonly externalRef: string
	readonly createdBy: UserId | undefined
	readonly createdAt: Date
	readonly updatedAt: Date
}

export const isTerminal = (status: TicketStatus): boolean => status === 'closed' || status === 'cancelled'
