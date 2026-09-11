import { useCallback, useMemo, useSyncExternalStore } from 'react'

export const MEDIA_QUERIES = {
	tablet: '(min-width: 768px)',
	desktop: '(min-width: 1024px)',
	mobile: '(max-width: 767px)',
} as const

type MediaQuery = Readonly<(typeof MEDIA_QUERIES)[keyof typeof MEDIA_QUERIES]>

export const useMediaQuery = (query: MediaQuery) => {
	const mediaQuery = useMemo(() => window.matchMedia(query), [query])

	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			mediaQuery.addEventListener('change', onStoreChange)
			return () => mediaQuery.removeEventListener('change', onStoreChange)
		},
		[mediaQuery],
	)

	const getSnapshot = useCallback(() => mediaQuery.matches, [mediaQuery])

	const getServerSnapshot = () => {
		throw Error('useMediaQuery is a client-only hook')
	}

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
