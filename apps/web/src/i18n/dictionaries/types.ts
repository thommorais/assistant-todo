import type common from '_/i18n/content/common.content'

import type { locales } from './locales'

type Locale = (typeof locales)[number]

/**
 * Every translation key, derived straight from the Intlayer content scopes that
 * actually back the app at runtime (see `config-client`'s `useI18n`). Keys are
 * unique across scopes, so their union is the flat lookup the app is written
 * against — `t(key)` and the pets form error keys are checked against it.
 */
type LocaleKey = keyof (typeof common)['content']

export type { Locale, LocaleKey }
