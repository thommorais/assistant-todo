import { clsx } from '_/lib/clsx'
import { type ComponentProps, useId } from 'react'

type State = {
	value: string
	label: string
}

type BinarySwitchProps = {
	states: [State, State]
	value: State['value']
	onChange: (value: string) => void
} & ComponentProps<'div'>

const BinarySwitch = ({ states, value, onChange, className }: BinarySwitchProps) => {
	const id = useId()
	return (
		<div
			className={clsx(
				className,
				'before:absolute before:inset-px before:rounded-[calc(var(--radius-md)-1px)] before:bg-white before:shadow-sm',
				'overflow-clip',
				'relative block w-full appearance-none rounded-md',
				'text-info-700 placeholder:text-info-500 text-base/6 sm:text-base',
				'border-info-700/20 data-hover:border-info-700/30 border',
				'bg-transparent',
				'focus:outline-hidden',
			)}
		>
			{states.map(state => (
				<label
					key={state.value}
					htmlFor={state.value}
					className='relative inline-flex items-center gap-2 px-2 py-[calc(calc(var(--spacing)*3)-1px)] md:px-4'
				>
					<input
						type='radio'
						name={`binary-switch-${id}`}
						value={state.value}
						id={state.value}
						checked={value === state.value}
						onChange={() => onChange(state.value)}
						className='peer sr-only'
					/>
					<span className='text-info-700/70 relative z-20 cursor-pointer text-sm capitalize peer-checked:text-white'>
						{state.label}
					</span>

					<span className='peer-checked:bg-primary-500 absolute inset-0 z-10' />
				</label>
			))}
		</div>
	)
}

export { BinarySwitch }
