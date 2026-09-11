import { formatDate, parseDate } from '@thom/libs/date'
import { FormInput } from '_/components/ui/form-view-components'
import { MEDIA_QUERIES, useMediaQuery } from '_/hooks/use-media-query'
import { useCurrentLocale } from '_/i18n/config-client'
import { ComponentProps, useCallback, useState } from 'react'

type DateInputProps = {
	onChange: (value: string) => void
	/** Seeds the field once, for editing an existing row. */
	initialValue?: string
} & Omit<ComponentProps<typeof FormInput>, 'type' | 'onChange' | 'value' | 'placeholder'>

const DateInput = ({ onChange, initialValue = '', ...props }: DateInputProps) => {
	const [value, setValue] = useState(initialValue)
	const isDesktop = useMediaQuery(MEDIA_QUERIES.desktop)

	const locale = useCurrentLocale()

	const handleChange = useCallback(
		(enteredValue: string | null) => {
			setValue(enteredValue ?? '')

			let change = enteredValue ?? ''
			if (isDesktop) {
				const parsedDate = Number(parseDate(enteredValue ?? '', locale))
				change = parsedDate ? formatDate(parsedDate, locale) : ''
			}
			onChange(change)
		},
		[onChange, locale, isDesktop],
	)

	const placeholder = locale === 'pt' ? 'dd/mm/aaaa' : 'yyyy-mm-dd'
	const type = isDesktop ? 'text' : 'date'

	return (
		<FormInput
			{...props}
			type={type}
			placeholder={placeholder}
			value={value}
			onChange={e => handleChange(e.target.value)}
		/>
	)
}

export { DateInput }
