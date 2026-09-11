import { createFileRoute } from '@tanstack/react-router'
import { Plans } from '_/pages/plans'

export const Route = createFileRoute('/_authenticated/$slug/plans')({
	component: Plans,
})
