import { tv } from '_/lib/third-party/tv'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

const pillStyles = tv({
	base: 'stretch-0 bg-info-100 text-info-700 inline-flex items-center gap-1 self-start rounded-full px-3 py-1 text-sm',
	variants: {
		disabled: {
			true: 'cursor-not-allowed opacity-50',
			false: '',
		},
	},
})

type PillProps = {
	id: string
	label: string
	disabled?: boolean
	onRemove: ComponentProps<'button'>['onClick']
} & ComponentProps<'button'> &
	ComponentProps<'span'>

const Pill = ({ id, label, onRemove, className, disabled }: PillProps) => {
	return (
		<span key={id} className={pillStyles({ disabled, class: className })}>
			{label}
			<button
				type='button'
				onClick={onRemove}
				disabled={disabled}
				className='hover:bg-info-200 rounded-full p-0.5 disabled:opacity-50'
				aria-label={`Remove ${label}`}
			>
				<X className='size-3.5' />
			</button>
		</span>
	)
}

const pillListStyles = tv({
	base: 'flex flex-wrap gap-2',
})

type PillListProps = ComponentProps<'div'>

const PillList = ({ children, className, ...props }: PillListProps) => {
	return (
		<div {...props} className={pillListStyles({ class: className })}>
			{children}
		</div>
	)
}

export { Pill, PillList }
