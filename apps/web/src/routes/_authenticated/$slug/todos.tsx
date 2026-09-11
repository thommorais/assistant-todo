import { createFileRoute } from '@tanstack/react-router'
import { Todos } from '_/pages/todos'

export const Route = createFileRoute('/_authenticated/$slug/todos')({
	component: Todos,
})
