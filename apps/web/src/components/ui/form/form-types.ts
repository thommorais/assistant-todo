import type { LocaleKey } from '_/i18n/dictionaries/types'
import type { FormEvent } from 'react'

/**
 * Form values are what the controls hold: text the user typed, or a flag they
 * ticked. Domain types are recovered at the submit boundary, not carried
 * through the inputs.
 */
export type FormValues = Readonly<Record<string, string | boolean>>

/** The fields a text control can address, and the ones a checkbox can. */
export type TextFieldName<TValues extends FormValues> = {
	[K in keyof TValues]-?: TValues[K] extends string ? K : never
}[keyof TValues] &
	string

export type FlagFieldName<TValues extends FormValues> = {
	[K in keyof TValues]-?: TValues[K] extends boolean ? K : never
}[keyof TValues] &
	string

export type FormMode = 'create' | 'edit'

export type FormErrors<TValues extends FormValues> = Partial<Readonly<Record<keyof TValues, LocaleKey>>>

export type FormState<TValues extends FormValues> = {
	readonly values: TValues
	readonly errors: FormErrors<TValues>
	readonly isSubmitting: boolean
	readonly submitError: string | null
}

export type FormActions<TValues extends FormValues> = {
	readonly setField: (key: keyof TValues & string, value: string) => void
	readonly setFlag?: (key: keyof TValues & string, value: boolean) => void
	readonly submit: (event: FormEvent<HTMLFormElement>) => void
	readonly cancel: () => void
}

/** Whatever the form needs that is neither a value nor an action. Forms extend it. */
export type FormMeta = {
	readonly mode: FormMode
}

export type FormContextValue<TValues extends FormValues, TMeta extends FormMeta = FormMeta> = {
	readonly state: FormState<TValues>
	readonly actions: FormActions<TValues>
	readonly meta: TMeta
}
