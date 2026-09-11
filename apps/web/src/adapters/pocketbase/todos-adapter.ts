import { projectId as toProjectId, userId as toUserId } from '_/core/domain/project'
import type { Priority, Todo, TodoStatus } from '_/core/domain/todo'
import { planId as toPlanId, todoId as toTodoId } from '_/core/domain/todo'
import type { TodoFilter, TodosPort } from '_/core/ports/todos'
import { journUrl, pb } from './client'

type TodoView = {
	id: string
	project_id: string
	plan_id?: string
	title: string
	details?: string
	status: string
	priority: string
	tags: string[]
	position: number
	depends_on: string[]
	due_date?: string
	blocked: boolean
	created_by?: string
	created_at: string
	updated_at: string
}

const toTodo = (view: TodoView): Todo => ({
	id: toTodoId(view.id),
	projectId: toProjectId(view.project_id),
	planId: view.plan_id ? toPlanId(view.plan_id) : undefined,
	title: view.title,
	details: view.details ?? '',
	status: view.status as TodoStatus,
	priority: view.priority as Priority,
	tags: view.tags ?? [],
	position: view.position,
	dependsOn: (view.depends_on ?? []).map(toTodoId),
	dueDate: view.due_date ? new Date(view.due_date) : undefined,
	blocked: view.blocked,
	createdBy: view.created_by ? toUserId(view.created_by) : undefined,
	createdAt: new Date(view.created_at),
	updatedAt: new Date(view.updated_at),
})

const toQuery = (filter: TodoFilter): string => {
	const params = new URLSearchParams()
	if (filter.status?.length) params.set('status', filter.status.join(','))
	if (filter.priority) params.set('priority', filter.priority)
	if (filter.tags?.length) params.set('tags', filter.tags.join(','))
	if (filter.search) params.set('q', filter.search)
	if (filter.limit !== undefined) params.set('limit', String(filter.limit))
	if (filter.offset !== undefined) params.set('offset', String(filter.offset))

	const query = params.toString()
	return query === '' ? '' : `?${query}`
}

export const createTodosAdapter = (): TodosPort => ({
	list: async (project, filter = {}) => {
		const response = await fetch(journUrl(`/projects/${project}/todos${toQuery(filter)}`), {
			headers: { Authorization: pb.authStore.token },
		})

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`)
		}

		const body = (await response.json()) as { todos?: TodoView[] }
		return (body.todos ?? []).map(toTodo)
	},
})
