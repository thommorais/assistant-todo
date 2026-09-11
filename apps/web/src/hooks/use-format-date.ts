import { formatCalendarDate } from '@thom/libs/date'
import { useCurrentLocale } from '_/i18n/config-client'
import { useCallback, useMemo } from 'react'

/**
 * Formatters bound to the app's locale.
 *
 * Date#toLocaleDateString() with no argument reads the *system* locale, so a
 * page rendered in Portuguese printed US-ordered dates on a US machine. Every
 * date goes through here so the app's own locale is the one that decides.
 *
 * The two are not interchangeable. A calendar day (an exam's collection date, a
 * birth date, anything behind an `<input type="date">`) is stored as a
 * UTC-midnight instant and has to be read back in UTC, or it lands on the
 * previous day for every viewer west of UTC. An instant (`created_at`,
 * `last_accessed_at`) is a real moment and should move with the viewer's
 * timezone.
 */

/** Formats a stored calendar day. Safe against timezone drift. */
export const useFormatDate = (): ((ms: number) => string) => {
	const locale = useCurrentLocale()

	return useCallback(
		(ms: number): string => (Number.isNaN(new Date(ms).getTime()) ? '—' : formatCalendarDate(ms, locale)),
		[locale],
	)
}

/** Formats a true instant in the viewer's own timezone. */
export const useFormatInstant = (): ((ms: number) => string) => {
	const locale = useCurrentLocale()
	const formatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale])

	return useCallback(
		(ms: number): string => {
			const date = new Date(ms)
			return Number.isNaN(date.getTime()) ? '—' : formatter.format(date)
		},
		[formatter],
	)
}
