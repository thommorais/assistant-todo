import { createFileRoute } from '@tanstack/react-router'
import { SignupPage } from '_/features/auth/ui/pages/signup-page'

export const Route = createFileRoute('/_auth/welcome')({
	staticData: { title: 'welcome' },
	component: SignupPage,
})
