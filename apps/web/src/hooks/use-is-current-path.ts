import { useCurrentLocale } from '_/i18n/config-client'
import { defaultLocale } from '_/i18n/dictionaries/locales'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

const useIsCurrentPath = () => {
	const pathname = usePathname()
	const currentLocale = useCurrentLocale()

	return useCallback(
		(path: string, exact?: boolean) => {
			const pathWithLocale = defaultLocale === currentLocale ? path : `/${currentLocale}${path}`
			if (exact) {
				return pathname === pathWithLocale
			}

			return pathname === pathWithLocale || pathname.startsWith(pathWithLocale)
		},
		[pathname, currentLocale],
	)
}

export { useIsCurrentPath }
