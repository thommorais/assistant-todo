import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '_/features/auth/ui/pages/login-page'

export const Route = createFileRoute('/_auth/login')({
	staticData: { title: 'login' },
	component: LoginPage,
})
