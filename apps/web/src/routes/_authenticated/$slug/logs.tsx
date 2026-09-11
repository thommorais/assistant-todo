import { createFileRoute } from '@tanstack/react-router'
import { Logs } from '_/pages/logs'

export const Route = createFileRoute('/_authenticated/$slug/logs')({
	component: Logs,
})
