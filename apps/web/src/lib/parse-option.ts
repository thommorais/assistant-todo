/**
 * Narrows free text back to one of a domain's own values. Form state is text,
 * so the value a select carried is only a domain value once it survives this.
 */
export const parseOption = <T extends string>(options: ReadonlyArray<T>, value: string, fallback: T): T =>
	options.find(option => option === value) ?? fallback

/** Same, for a field where "none of them" is a value the domain accepts. */
export const parseOptionOrNull = <T extends string>(options: ReadonlyArray<T>, value: string): T | null =>
	options.find(option => option === value) ?? null
