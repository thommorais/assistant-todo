import { createFileRoute } from '@tanstack/react-router'
import { Docs } from '_/pages/docs'

export const Route = createFileRoute('/_authenticated/$slug/docs')({
	component: Docs,
})
