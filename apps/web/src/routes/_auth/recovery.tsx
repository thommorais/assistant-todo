import { createFileRoute } from '@tanstack/react-router'

const RecoveryPage = () => <h1>Recovery Page</h1>

export const Route = createFileRoute('/_auth/recovery')({
	staticData: { title: 'recovery' },
	component: RecoveryPage,
})
