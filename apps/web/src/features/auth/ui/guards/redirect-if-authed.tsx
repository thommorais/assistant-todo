import { ROUTES } from '_/constants/routes'
import { useAuth } from '_/features/auth/ui/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { type ComponentProps, useEffect } from 'react'

const isInternalUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url, window.location.origin)
		return parsedUrl.origin === window.location.origin
	} catch {
		return false
	}
}

const AuthGuard = ({ children }: ComponentProps<'div'>) => {
	const { isAuthenticated, isInitializing } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isInitializing && isAuthenticated) {
			const referrer = document.referrer

			if (referrer === '') {
				router.push(ROUTES.pets.root)
				return
			}

			if (referrer && isInternalUrl(referrer)) {
				const referrerPath = new URL(referrer).pathname
				router.push(referrerPath)
			} else {
				router.push(ROUTES.home)
			}
		}
	}, [isAuthenticated, isInitializing, router])

	if (!isAuthenticated && isInitializing) {
		return null
	}

	if (!isInitializing && isAuthenticated) {
		return null
	}

	return children
}

export { AuthGuard }
