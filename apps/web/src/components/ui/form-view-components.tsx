import { Input } from '@thom/ui/input'
import { Textarea } from '@thom/ui/textarea'
import { tv } from '_/lib/third-party/tv'

const formStyles = tv({
	slots: {
		wrapper: 'mx-auto w-full max-w-2xl',
		formField: '',
		label: 'text-info-700 mb-2 block text-sm font-medium',
		required: 'text-red-500',
		input: 'w-full rounded-sm',
		textarea: 'resize-none',
		error: 'mt-1 text-sm text-red-500',
		charCount: 'text-info-700/50 mt-1 text-xs',
		itemLabel: 'text-info-700 block text-sm font-medium',
		itemDescription: 'text-info-700/70 text-xs',
		itemTitle: 'text-info-700 font-semibold',
		itemContent: 'relative z-10',
	},
	variants: {
		hasError: {
			true: {
				input: 'border-red-500',
				textarea: 'border-red-500',
			},
			false: {},
		},
	},
})

const styles = formStyles()

import type { ComponentProps } from 'react'

export const FormWrapper = ({ children }: { readonly children: React.ReactNode }) => {
	return <div className={styles.wrapper()}>{children}</div>
}

// Form field components
export const FormField = ({ children }: { readonly children: React.ReactNode }) => {
	return <div className={styles.formField()}>{children}</div>
}

type FormLabelProps = {
	readonly children: React.ReactNode
	readonly htmlFor: string
}

export const FormLabel = ({ children, htmlFor }: FormLabelProps) => {
	return (
		<label htmlFor={htmlFor} className={styles.label()}>
			{children}
		</label>
	)
}

export const FormRequired = () => {
	return <span className={styles.required()}>*</span>
}

export const FormError = ({ children }: { readonly children: React.ReactNode }) => {
	return <p className={styles.error()}>{children}</p>
}

export const FormCharCount = ({ children }: { readonly children: React.ReactNode }) => {
	return <p className={styles.charCount()}>{children}</p>
}

// Fieldset components
export const FormFieldset = ({ children }: { readonly children: React.ReactNode }) => {
	return <fieldset>{children}</fieldset>
}

export const FormLegend = ({ children }: { readonly children: React.ReactNode }) => {
	return <legend className={styles.label()}>{children}</legend>
}

// Form input components
type FormInputProps = {
	readonly id: string
	readonly value: string
	readonly placeholder?: string
	readonly maxLength?: number
	readonly disabled?: boolean
	readonly hasError?: boolean
	readonly step?: string
	readonly min?: string
	readonly autoComplete?: string
} & ComponentProps<typeof Input>

// The rest is passed straight through: a caller needs inputMode for a numeric
// keypad, or a ref to keep focus after a save, and listing every such prop here
// only means discovering the next one is missing at runtime.
export const FormInput = ({
	id,
	value,
	onChange,
	placeholder,
	maxLength,
	disabled,
	hasError,
	step,
	min,
	autoComplete,
	type = 'text',
	className,
	...rest
}: FormInputProps) => {
	const variants = formStyles({ hasError })
	return (
		<Input
			type={type}
			id={id}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			maxLength={maxLength}
			disabled={disabled}
			step={step}
			min={min}
			autoComplete={autoComplete}
			className={variants.input({ class: className })}
			{...rest}
		/>
	)
}

type FormTextareaProps = {
	readonly id: string
	readonly value: string
	readonly placeholder?: string
	readonly maxLength?: number
	readonly rows?: number
	readonly disabled?: boolean
	readonly hasError?: boolean
} & ComponentProps<'textarea'>

export const FormTextarea = ({
	id,
	value,
	onChange,
	placeholder,
	maxLength,
	rows,
	disabled,
	hasError,
}: FormTextareaProps) => {
	const variants = formStyles({ hasError })

	return (
		<Textarea
			id={id}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			maxLength={maxLength}
			rows={rows}
			disabled={disabled}
			className={variants.textarea()}
			resizable={false}
		/>
	)
}

// Form item text components
export const FormItemLabel = ({ children }: { readonly children: React.ReactNode }) => (
	<div className={styles.itemLabel()}>{children}</div>
)

export const FormItemDescription = ({ children }: { readonly children: React.ReactNode }) => (
	<p className={styles.itemDescription()}>{children}</p>
)

export const FormItemTitle = ({ children }: { readonly children: React.ReactNode }) => (
	<h3 className={styles.itemTitle()}>{children}</h3>
)

export const FormItemContent = ({ children }: { readonly children: React.ReactNode }) => (
	<div className={styles.itemContent()}>{children}</div>
)
