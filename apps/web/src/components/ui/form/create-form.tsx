import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@thom/ui/card'
import { Select } from '@thom/ui/select'
import type {
	FlagFieldName,
	FormActions,
	FormContextValue,
	FormMeta,
	FormState,
	FormValues,
	TextFieldName,
} from '_/components/ui/form/form-types'
import { Checkbox } from '@thom/ui/checkbox'
import {
	FormCharCount,
	FormError,
	FormField,
	FormInput,
	FormItemDescription,
	FormItemLabel,
	FormLabel,
	FormRequired,
	FormTextarea,
	FormWrapper,
} from '_/components/ui/form-view-components'
import { HapticButton } from '_/components/ui/haptic-button'
import { useI18n } from '_/i18n/config-client'
import type { LocaleKey } from '_/i18n/dictionaries/types'
import { type ComponentProps, createContext, type ReactNode, use, useId, useMemo } from 'react'

type TextInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'time'

/**
 * Builds one form's compound components over a shared context. The pieces read
 * `state`, `actions` and `meta` from the provider above them, so a view lists
 * the fields it has and nothing else: no values, no handlers, no prop drilling.
 *
 * The provider is the only place that knows how the state is managed, which is
 * what lets the same composed view sit on a `useState` hook, a store or a
 * server sync.
 */
export const createForm = <TValues extends FormValues, TMeta extends FormMeta = FormMeta>() => {
	type FieldName = TextFieldName<TValues>
	type FlagName = FlagFieldName<TValues>

	/** Values are read back through their control's own type; nothing else can address the field. */
	const readText = (values: TValues, name: string): string => {
		const value = values[name]
		return typeof value === 'string' ? value : ''
	}

	const readFlag = (values: TValues, name: string): boolean => values[name] === true

	const FormContext = createContext<FormContextValue<TValues, TMeta> | null>(null)
	/**
	 * The form element's id, so a submit button works from anywhere inside the
	 * provider: a dialog's actions row sits outside the form it submits.
	 */
	const FormIdContext = createContext('')

	const useForm = (): FormContextValue<TValues, TMeta> => {
		const context = use(FormContext)

		if (!context) {
			throw new Error('Form components must be used within their form provider')
		}

		return context
	}

	type ProviderProps = {
		readonly state: FormState<TValues>
		readonly actions: FormActions<TValues>
		readonly meta: TMeta
		readonly children: ReactNode
	}

	const Provider = ({ state, actions, meta, children }: ProviderProps) => {
		const formId = useId()
		const value = useMemo(() => ({ state, actions, meta }), [state, actions, meta])

		return (
			<FormContext value={value}>
				<FormIdContext value={formId}>{children}</FormIdContext>
			</FormContext>
		)
	}

	const Frame = ({ children }: { readonly children: ReactNode }) => {
		const { actions } = useForm()
		const formId = use(FormIdContext)

		return (
			<FormWrapper>
				<form id={formId} onSubmit={actions.submit} noValidate>
					<Card>{children}</Card>
				</form>
			</FormWrapper>
		)
	}

	/** For a form that lives inside another surface and brings no chrome of its own. */
	const Inline = ({ children, className }: { readonly children: ReactNode; readonly className?: string }) => {
		const { actions } = useForm()
		const formId = use(FormIdContext)

		return (
			<form id={formId} onSubmit={actions.submit} noValidate className={className}>
				{children}
			</form>
		)
	}

	const Title = ({ children }: { readonly children: ReactNode }) => (
		<CardHeader>
			<CardTitle>{children}</CardTitle>
		</CardHeader>
	)

	const Body = ({ children }: { readonly children: ReactNode }) => <CardContent spacing='lg'>{children}</CardContent>

	const ROW_COLUMNS = {
		2: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
		3: 'grid grid-cols-1 gap-4 sm:grid-cols-3',
	} as const

	const Row = ({ children, columns = 2 }: { readonly children: ReactNode; readonly columns?: 2 | 3 }) => (
		<div className={ROW_COLUMNS[columns]}>{children}</div>
	)

	const Actions = ({ children }: { readonly children: ReactNode }) => (
		<CardFooter className='w-full justify-end'>{children}</CardFooter>
	)

	type ButtonProps = {
		readonly children?: ReactNode
		readonly size?: ComponentProps<typeof HapticButton>['size']
		readonly fullWidth?: boolean
	}

	const Cancel = ({ children, size }: ButtonProps) => {
		const t = useI18n()
		const { state, actions } = useForm()

		return (
			<HapticButton type='button' variant='ghost' size={size} onClick={actions.cancel} disabled={state.isSubmitting}>
				{children ?? t('cancel')}
			</HapticButton>
		)
	}

	const Submit = ({ children, size, fullWidth }: ButtonProps) => {
		const t = useI18n()
		const { state } = useForm()
		const formId = use(FormIdContext)

		return (
			<HapticButton
				type='submit'
				form={formId}
				color='primary'
				size={size}
				fullWidth={fullWidth}
				loading={state.isSubmitting}
			>
				{children ?? t('save')}
			</HapticButton>
		)
	}

	const SubmitError = () => {
		const { state } = useForm()

		if (!state.submitError) {
			return null
		}

		return <FormError>{state.submitError}</FormError>
	}

	const FieldError = ({ name }: { readonly name: keyof TValues & string }) => {
		const t = useI18n()
		const { state } = useForm()
		const error = state.errors[name]

		if (!error) {
			return null
		}

		return <FormError>{t(error)}</FormError>
	}

	/** A translation key, or text the caller had to build (a unit, a name it read). */
	type FieldLabel = LocaleKey | { readonly text: string }

	const Label = ({
		htmlFor,
		label,
		required,
	}: {
		readonly htmlFor: string
		readonly label: FieldLabel
		readonly required?: boolean
	}) => {
		const t = useI18n()

		return (
			<FormLabel htmlFor={htmlFor}>
				{typeof label === 'string' ? t(label) : label.text} {required && <FormRequired />}
			</FormLabel>
		)
	}

	type TextProps = {
		readonly name: FieldName
		readonly label: FieldLabel
		readonly type?: TextInputType
		readonly required?: boolean
		readonly placeholder?: LocaleKey
		readonly maxLength?: number
		readonly hint?: LocaleKey
		readonly step?: string
		readonly min?: string
		/** For a field whose limit is worth watching while typing. */
		readonly counter?: boolean
		/** What a password manager should offer here. */
		readonly autoComplete?: string
	}

	const Text = ({
		name,
		label,
		type = 'text',
		required,
		placeholder,
		maxLength,
		hint,
		step,
		min,
		counter,
		autoComplete,
	}: TextProps) => {
		const t = useI18n()
		const id = useId()
		const { state, actions } = useForm()
		const value = readText(state.values, name)
		const error = state.errors[name]

		return (
			<FormField>
				<Label htmlFor={id} label={label} required={required} />
				<FormInput
					id={id}
					type={type}
					value={value}
					onChange={event => actions.setField(name, event.target.value)}
					placeholder={placeholder && t(placeholder)}
					maxLength={maxLength}
					disabled={state.isSubmitting}
					hasError={!!error}
					step={step}
					min={min}
					autoComplete={autoComplete}
				/>
				{hint && !error && <FormCharCount>{t(hint)}</FormCharCount>}
				{counter && maxLength && (
					<FormCharCount>
						{value.length}/{maxLength}
					</FormCharCount>
				)}
				<FieldError name={name} />
			</FormField>
		)
	}

	type TextareaProps = {
		readonly name: FieldName
		readonly label: FieldLabel
		readonly rows?: number
		readonly maxLength?: number
		readonly placeholder?: LocaleKey
		readonly hint?: LocaleKey
	}

	/**
	 * A limit brings its own character counter, so the two cannot drift apart. A
	 * hint takes that spot when the field has something more useful to say.
	 */
	const Textarea = ({ name, label, rows = 3, maxLength, placeholder, hint }: TextareaProps) => {
		const t = useI18n()
		const id = useId()
		const { state, actions } = useForm()
		const value = readText(state.values, name)
		const error = state.errors[name]

		return (
			<FormField>
				<Label htmlFor={id} label={label} />
				<FormTextarea
					id={id}
					value={value}
					onChange={event => actions.setField(name, event.target.value)}
					placeholder={placeholder && t(placeholder)}
					rows={rows}
					maxLength={maxLength}
					disabled={state.isSubmitting}
					hasError={!!error}
				/>
				{hint && !error && <FormCharCount>{t(hint)}</FormCharCount>}
				{!hint && maxLength && !error && (
					<FormCharCount>
						{value.length}/{maxLength}
					</FormCharCount>
				)}
				<FieldError name={name} />
			</FormField>
		)
	}

	type Option<K extends FieldName> = {
		readonly value: TValues[K] & string
	} & ({ readonly label: LocaleKey } | { readonly text: string })

	type SelectFieldProps<K extends FieldName> = {
		readonly name: K
		readonly label: FieldLabel
		readonly options: ReadonlyArray<Option<K>>
		readonly required?: boolean
		readonly hint?: LocaleKey
		/**
		 * Labels the empty value. A select without one cannot be left unanswered,
		 * and on a required field it can be read but never chosen back.
		 */
		readonly emptyLabel?: LocaleKey
	}

	/**
	 * Options carry the field's own value type, so a select can only ever offer
	 * values the field accepts. Their own labels are translation keys; a list
	 * read from the database brings its text along instead.
	 */
	const SelectField = <K extends FieldName>({
		name,
		label,
		options,
		required,
		hint,
		emptyLabel,
	}: SelectFieldProps<K>) => {
		const t = useI18n()
		const id = useId()
		const { state, actions } = useForm()
		const value = readText(state.values, name)

		return (
			<FormField>
				<Label htmlFor={id} label={label} required={required} />
				<Select
					id={id}
					value={value}
					onChange={event => actions.setField(name, event.target.value)}
					disabled={state.isSubmitting}
				>
					{emptyLabel && (
						<option value='' disabled={required}>
							{t(emptyLabel)}
						</option>
					)}
					{options.map(option => (
						<option key={option.value} value={option.value}>
							{'label' in option ? t(option.label) : option.text}
						</option>
					))}
				</Select>
				{hint && <FormCharCount>{t(hint)}</FormCharCount>}
				<FieldError name={name} />
			</FormField>
		)
	}

	type CheckboxProps = {
		readonly name: FlagName
		readonly label: LocaleKey
		readonly description?: LocaleKey
	}

	/** A flag reads as a sentence, so its label and reason sit next to the box rather than above it. */
	const CheckboxField = ({ name, label, description }: CheckboxProps) => {
		const t = useI18n()
		const { state, actions } = useForm()

		return (
			<label className='flex cursor-pointer items-start gap-3'>
				<Checkbox
					checked={readFlag(state.values, name)}
					onChange={next => actions.setFlag?.(name, next)}
					disabled={state.isSubmitting}
					className='mt-0.5 shrink-0'
				/>
				<span className='min-w-0 flex-1'>
					<FormItemLabel>{t(label)}</FormItemLabel>
					{description && <FormItemDescription>{t(description)}</FormItemDescription>}
				</span>
			</label>
		)
	}

	return {
		use: useForm,
		Checkbox: CheckboxField,
		Provider,
		Frame,
		Inline,
		Title,
		Body,
		Row,
		Actions,
		Cancel,
		Submit,
		SubmitError,
		Field: FormField,
		Label,
		Error: FieldError,
		Text,
		Textarea,
		Select: SelectField,
	}
}
