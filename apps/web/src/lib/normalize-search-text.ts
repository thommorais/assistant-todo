// Matches the combining diacritical marks block that NFD normalization
// splits accented letters into, e.g. the a-with-acute in "analise" becomes
// a plain "a" followed by one of these marks.
const COMBINING_DIACRITICS = /[\u0300-\u036f]/g

// Lowercases and strips diacritics so a search for "analise" also matches
// its accented spelling, and "creatithom" matches "Creatithom".
export const normalizeSearchText = (value: string): string =>
	value.normalize('NFD').replace(COMBINING_DIACRITICS, '').toLowerCase()
