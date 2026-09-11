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
	const common = useIntlayer('common')

	const lookup = useMemo(() => {
		return {
			...common,
		}
	}, [common])

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
