import { useMatches } from '@tanstack/react-router'
import { useI18n } from '_/i18n/config-client'
import type { LocaleKey } from '_/i18n/dictionaries/types'

declare module '@tanstack/react-router' {
	interface StaticDataRouteOption {
		title?: LocaleKey
	}
}

const SITE_NAME = 'thom'

const DocumentTitle = () => {
	const t = useI18n()
	const matches = useMatches()
	const key = matches.findLast(match => match.staticData.title)?.staticData.title

	return <title>{key ? `${t(key)} · ${SITE_NAME}` : SITE_NAME}</title>
}

export { DocumentTitle }
