import { createFileRoute } from '@tanstack/react-router'
import { Tickets } from '_/pages/tickets'

export const Route = createFileRoute('/_authenticated/$slug/tickets/')({
	component: Tickets,
})
