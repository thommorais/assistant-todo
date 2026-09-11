import * as Headless from '@headlessui/react'
import { cn } from '@thom/libs/cn'
import type React from 'react'

export function Popover(props: Headless.PopoverProps) {
	return <Headless.Popover {...props} />
}

export function PopoverButton<T extends React.ElementType = 'button'>({
	className,
	...props
}: { className?: string } & Omit<Headless.PopoverButtonProps<T>, 'as' | 'className'>) {
	return <Headless.PopoverButton {...props} className={cn('focus:outline-hidden', className)} />
}

export function PopoverPanel({
	anchor = 'bottom',
	className,
	...props
}: { className?: string } & Omit<Headless.PopoverPanelProps, 'as' | 'className'>) {
	return (
		<Headless.PopoverPanel
			{...props}
			transition
			anchor={anchor}
			className={cn(
				'[--anchor-gap:--spacing(2)] [--anchor-padding:--spacing(1)]',
				'isolate w-max overflow-y-auto p-1',
				'border-border bg-popover text-popover-foreground border',
				'shadow-md',
				'focus:outline-hidden',
				'transition data-closed:data-leave:opacity-0 data-leave:duration-100 data-leave:ease-in',
				className,
			)}
		/>
	)
}
