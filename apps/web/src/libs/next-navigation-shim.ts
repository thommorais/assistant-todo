import { useLocation, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

/**
 * Drop-in replacement for `next/navigation` in the Vite SPA.
 *
 * Backs the subset of the App Router API this codebase uses
 * (`useRouter().push/replace/back`, `usePathname`) with TanStack Router.
 */

type AppRouterInstance = {
	push: (href: string) => void
	replace: (href: string) => void
	back: () => void
	forward: () => void
	refresh: () => void
	prefetch: (href: string) => void
}

const useRouter = (): AppRouterInstance => {
	const navigate = useNavigate()

	return useMemo<AppRouterInstance>(
		() => ({
			// TanStack's typed router rejects arbitrary string paths; hrefs come
			// from the shared ROUTES map, so cast through.
			push: (href: string) => void navigate({ to: href as never }),
			replace: (href: string) => void navigate({ to: href as never, replace: true }),
			back: () => window.history.back(),
			forward: () => window.history.forward(),
			refresh: () => {},
			prefetch: () => {},
		}),
		[navigate],
	)
}

const usePathname = (): string => useLocation({ select: location => location.pathname })

export { usePathname, useRouter }
