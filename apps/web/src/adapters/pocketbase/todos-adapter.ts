import { projectId as toProjectId, userId as toUserId } from '_/core/domain/project'
import type { Priority, Todo, TodoStatus } from '_/core/domain/todo'
import { planId as toPlanId, todoId as toTodoId } from '_/core/domain/todo'
import type { TodoFilter, TodosPort } from '_/core/ports/todos'
import { err, ok, type Result } from '_/lib/result'
import { Collections, type JournTodosResponse } from '_/pocketbase-types'
import { getPocketBaseClient } from './client'
import { filterFor } from './filter-builder'
import { paginate } from './paginate'

type TodoRecord = JournTodosResponse<string[], string[]>

type TodoColumns = {
	'project.slug': string
	title: string
} & TodoFilter

const toTodo = (record: TodoRecord): Todo => ({
	id: toTodoId(record.id),
	projectId: toProjectId(record.project),
	planId: record.plan ? toPlanId(record.plan) : undefined,
	title: record.title,
	details: record.details ?? '',
	status: record.status as TodoStatus,
	priority: record.priority as Priority,
	tags: record.tags ?? [],
	position: record.position ?? 0,
	dependsOn: (record.depends_on ?? []).map(toTodoId),
	dueDate: record.due_date ? new Date(record.due_date) : undefined,
	createdBy: record.created_by ? toUserId(record.created_by) : undefined,
	createdAt: new Date(record.created),
	updatedAt: new Date(record.updated),
})

export const createTodosAdapter = (): TodosPort => {
	const client = getPocketBaseClient()

	return {
		list: async (project, filter = {}): Promise<Result<readonly Todo[]>> => {
			const { expr, params } = filterFor<TodoColumns>()([
				{ field: 'project.slug', comparator: 'eq', value: project },
				{ field: 'status', comparator: 'anyOf', value: filter.status },
				{ field: 'priority', comparator: 'eq', value: filter.priority },
				{ field: 'tags', comparator: 'containsAll', value: filter.tags },
				{ field: 'title', comparator: 'contains', value: filter.search },
			])

			try {
				const rows = await paginate<TodoRecord>(client.collection(Collections.JournTodos), filter, {
					filter: client.filter(expr, params),
					sort: 'position',
				})

				return ok(rows.map(toTodo))
			} catch (error) {
				return err(new Error(`Failed to list todos: ${error instanceof Error ? error.message : 'Unknown error'}`))
			}
		},
	}
}
