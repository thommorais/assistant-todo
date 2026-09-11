import { ROUTES } from '_/constants/routes'
import { useAuth } from '_/features/auth/ui/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { type ComponentProps, useEffect, useEffectEvent } from 'react'

const AuthGuard = ({ children }: ComponentProps<'div'>) => {
	const { isAuthenticated, isInitializing } = useAuth()
	const router = useRouter()
	const notAuthenticated = !isAuthenticated && !isInitializing
	const authenticating = !isAuthenticated && isInitializing

	const redirectUser = useEffectEvent(() => {
		router.replace(ROUTES.auth.login)
	})

	useEffect(() => {
		if (notAuthenticated) {
			redirectUser()
		}
	}, [notAuthenticated])

	if (authenticating || notAuthenticated) {
		return null
	}

	return children
}

export { AuthGuard }
