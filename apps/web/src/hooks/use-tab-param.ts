import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useMemo } from 'react'

type TabParamOptions<T extends string> = {
	readonly tabs: ReadonlyArray<T>
	readonly fallback: T
	readonly param?: string
}

type TabParamState<T extends string> = {
	readonly value: T
	readonly onValueChange: (next: string) => void
}

export const useTabParam = <T extends string>({
	tabs,
	fallback,
	param = 'tab',
}: TabParamOptions<T>): TabParamState<T> => {
	const parser = useMemo(() => parseAsStringLiteral(tabs).withDefault(fallback), [tabs, fallback])

	const [value, setValue] = useQueryState(param, {
		...parser,
		history: 'replace',
		clearOnDefault: true,
		shallow: true,
	})

	return { value, onValueChange: setValue as (next: T | string) => void }
}
