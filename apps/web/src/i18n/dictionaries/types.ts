import type common from '_/i18n/content/common.content'
import type { locales } from './locales'

type Locale = (typeof locales)[number]

type LocaleKey = keyof (typeof common)['content']

export type { Locale, LocaleKey }
