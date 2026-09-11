import * as Popover from '@radix-ui/react-popover'
import { useManualScroll } from '_/hooks/use-manual-scroll'
import { normalizeSearchText } from '_/lib/normalize-search-text'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export type NameOption = {
	readonly value: string
	readonly label: string
	/** Shown beside the label, for telling two same-named entries apart. */
	readonly hint?: string
}

type NameComboboxProps = {
	readonly id?: string
	readonly value: string
	readonly onChange: (value: string) => void
	readonly options: ReadonlyArray<NameOption>
	readonly placeholder?: string
	readonly disabled?: boolean
	readonly emptyLabel: string
	/** Rendered as the "use what I typed" row, given the current query. Omit it
	 * to pick only from what exists: the create row disappears and the chosen
	 * option's `value` is committed instead of its label. Finance names a vendor
	 * it may be inventing; shopping picks one the directory already holds. */
	readonly createLabel?: (query: string) => string
}

/** Picks a name that already exists, or takes a new one.
 *
 * Shared: finance names a vendor and its branch with it, shopping names where a
 * trip is going. Both pick from the same global directory, so a picker that
 * only one of them had meant the other retyped names it already held.
 *
 * The transaction form used to ask for the vendor, branch and city as bare text
 * inputs, so every save retyped a name the directory already held and nothing
 * on screen said what was already there. Reuse still happens on write (the
 * repository matches on the normalized name), but only if the spelling happens
 * to match, and only after the fact.
 *
 * Choosing from the list is therefore the normal path, and typing is the escape
 * hatch for a genuinely new vendor, rather than the only thing on offer. What
 * this commits is still a name, not an id, so the repository's reuse-or-create
 * keeps working untouched. */
export const NameCombobox = ({
	id,
	value,
	onChange,
	options,
	placeholder,
	disabled,
	emptyLabel,
	createLabel,
}: NameComboboxProps) => {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	// The list is portalled out of any dialog that opened it, which is enough to
	// have its scrolling swallowed by that dialog's scroll lock.
	const [attachList, listRef] = useManualScroll<HTMLDivElement>()

	const needle = normalizeSearchText(query)
	const matches = needle
		? options.filter(option => normalizeSearchText(`${option.label} ${option.hint ?? ''}`).includes(needle))
		: options

	// Offered only when what was typed is not already one of the options, so the
	// list never shows "Create Brasão" directly above Brasão itself.
	const typed = query.trim()
	const showCreate =
		createLabel !== undefined &&
		typed !== '' &&
		!options.some(option => normalizeSearchText(option.label) === normalizeSearchText(typed))

	// Which side of the option a caller gets back: a name to reuse-or-create, or
	// the id of something that already exists.
	const commits = createLabel === undefined ? 'value' : ('label' as const)
	const selected = commits === 'value' ? options.find(option => option.value === value) : undefined
	const shownValue = commits === 'value' ? (selected?.label ?? '') : value

	const commit = (next: string) => {
		onChange(next)
		setOpen(false)
		setQuery('')
	}

	const moveFocus = (step: 1 | -1) => {
		const rows = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-option]')
		if (!rows || rows.length === 0) {
			return
		}
		const index = [...rows].findIndex(row => row === document.activeElement)
		const next = index < 0 ? (step === 1 ? 0 : rows.length - 1) : (index + step + rows.length) % rows.length
		rows[next]?.focus()
	}

	const onKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			moveFocus(event.key === 'ArrowDown' ? 1 : -1)
			return
		}
		// Enter takes what was typed without a trip to the mouse, which is the
		// whole point of the escape hatch.
		if (event.key === 'Enter' && showCreate) {
			event.preventDefault()
			commit(typed)
		}
	}

	const optionClass =
		'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-primary-500/10 focus:bg-primary-500/10 focus:outline-hidden'

	return (
		<Popover.Root
			open={open}
			onOpenChange={next => {
				setOpen(next)
				if (!next) {
					setQuery('')
				}
			}}
		>
			<Popover.Trigger
				id={id}
				type='button'
				disabled={disabled}
				className='border-info-700/20 hover:border-info-700/30 flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-left text-base shadow-sm disabled:opacity-50'
			>
				<span className='min-w-0 flex-1 truncate'>
					{shownValue ? (
						<span className='text-foreground'>{shownValue}</span>
					) : (
						<span className='text-muted-foreground'>{placeholder ?? ''}</span>
					)}
				</span>
				<ChevronDown size={16} className='text-muted-foreground shrink-0' />
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					align='start'
					sideOffset={4}
					collisionPadding={8}
					onKeyDown={onKeyDown}
					className='z-50 flex max-h-[min(18rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) min-w-64 flex-col overflow-hidden rounded-xl bg-white p-1 shadow-lg ring-1 ring-black/10'
				>
					<input
						type='search'
						value={query}
						onChange={event => setQuery(event.target.value)}
						placeholder={placeholder}
						className='border-info-700/20 mb-1 w-full shrink-0 rounded-md border px-2.5 py-1.5 text-sm focus:outline-hidden'
					/>

					<div ref={attachList} className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
						{matches.map(option => (
							<button
								key={option.value}
								type='button'
								data-option
								onClick={() => commit(commits === 'value' ? option.value : option.label)}
								className={optionClass}
							>
								<span className='text-foreground min-w-0 flex-1 truncate'>{option.label}</span>
								{option.hint ? <span className='text-muted-foreground shrink-0 text-xs'>{option.hint}</span> : null}
								{(commits === 'value' ? option.value === value : normalizeSearchText(option.label) === normalizeSearchText(shownValue)) ? (
									<Check size={15} className='text-primary-600 shrink-0' />
								) : null}
							</button>
						))}

						{showCreate ? (
							<button type='button' data-option onClick={() => commit(typed)} className={optionClass}>
								<span className='text-foreground min-w-0 flex-1 truncate'>{createLabel(typed)}</span>
							</button>
						) : null}

						{matches.length === 0 && !showCreate ? (
							<p className='text-muted-foreground px-2.5 py-6 text-center text-sm'>{emptyLabel}</p>
						) : null}
					</div>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
