/**
 * Client i18n layer for the Vite SPA, backed by Intlayer.
 *
 * Preserves the public API the former `next-international` client config
 * exposed (`useI18n`, `useChangeLocale`, `useCurrentLocale`,
 * `I18nProviderClient`) so existing call sites need no changes. Content lives
 * in per-feature Intlayer dictionaries under `_/i18n/content`; this hook merges
 * the active-locale strings from every scope into a single `t(key, params)`
 * lookup, keeping the flat-key ergonomics the codebase is written against.
 */

import type { Locale, LocaleKey } from '_/i18n/dictionaries/types'
import { type ReactNode, useCallback, useMemo } from 'react'
import { IntlayerProvider, useIntlayer, useLocale } from 'react-intlayer'

type i18nParams = Record<string, unknown>

const interpolate = (template: string, params?: i18nParams): string => {
	if (!params) {
		return template
	}
	return template.replace(/\{(\w+)\}/g, (match, token: string) => (token in params ? String(params[token]) : match))
}

type ProviderProps = {
	locale?: Locale
	children: ReactNode
}

const I18nProviderClient = ({ locale, children }: ProviderProps): ReactNode => (
	<IntlayerProvider locale={locale} isCookieEnabled>
		{children}
	</IntlayerProvider>
)

const useLookup = () => {
	// One hook call per scope (fixed count) merged into a single flat lookup.
	// Keys are unique across scopes, so the merge is collision-free.
	const common = useIntlayer('common')
	const flags = useIntlayer('flags')
	const stacks = useIntlayer('stacks')
	const pets = useIntlayer('pets')
	const metrics = useIntlayer('metrics')
	const exams = useIntlayer('exams')
	const finance = useIntlayer('finance')
	const notifications = useIntlayer('notifications')
	const pomodoro = useIntlayer('pomodoro')
	const shopping = useIntlayer('shopping')

	const lookup = useMemo(() => {
		return {
			...common,
			...flags,
			...stacks,
			...pets,
			...metrics,
			...exams,
			...finance,
			...notifications,
			...pomodoro,
			...shopping,
		}
	}, [common, flags, stacks, pets, metrics, exams, finance, notifications, pomodoro, shopping])

	return lookup
}

type TranslateFn = (key: LocaleKey, params?: i18nParams) => string

const useI18n = (): TranslateFn => {
	const lookup = useLookup()

	return useCallback<TranslateFn>(
		(key, params) => {
			const node = lookup[key]
			if (node == null) {
				return key
			}
			return interpolate(String(node), params)
		},
		[lookup],
	)
}

const useCurrentLocale = (): Locale => useLocale().locale as Locale
const useChangeLocale = (): ((locale: Locale) => void) => useLocale().setLocale

export type { TranslateFn }
export { I18nProviderClient, useChangeLocale, useCurrentLocale, useI18n }
