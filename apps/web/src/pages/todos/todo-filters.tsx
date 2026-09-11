import { useNavigate, useSearch } from '@tanstack/react-router'
import { cn } from '@thom/libs/cn'
import { Popover, PopoverButton, PopoverPanel } from '@thom/ui/popover'
import { PRIORITIES, TODO_STATUSES, type Priority, type TodoStatus } from '_/core/domain/todo'
import { useTickets } from '_/app/use-tickets'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import type { TodosSearch } from '_/routes/_authenticated/$slug/todos'
import { TODO_STATUS_LABELS } from './status-labels'
import { CONTEXT_TAGS, KIND_TAGS } from './tag-vocabulary'

const SearchIcon = () => (
	<svg viewBox='0 0 16 16' fill='none' className='size-4' aria-hidden>
		<circle cx='7' cy='7' r='4.25' stroke='currentColor' strokeWidth='1.5' />
		<path d='M10.5 10.5L14 14' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
	</svg>
)

const FilterIcon = () => (
	<svg viewBox='0 0 16 16' fill='none' className='size-4' aria-hidden>
		<path d='M2 4h12M4 8h8M6.5 12h3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
	</svg>
)

const ClearIcon = ({ className }: { readonly className?: string }) => (
	<svg viewBox='0 0 16 16' fill='none' className={className} aria-hidden>
		<path d='M4 4l8 8M12 4l-8 8' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
	</svg>
)

const panelClasses = cn(
	'isolate w-max overflow-y-auto p-1',
	'border-border bg-popover text-popover-foreground border',
	'shadow-md focus:outline-hidden',
)

type CheckItemProps = {
	readonly label: string
	readonly checked: boolean
	readonly onToggle: () => void
}

const CheckItem = ({ label, checked, onToggle }: CheckItemProps) => (
	<button
		type='button'
		onClick={onToggle}
		className='data-focus:bg-accent hover:bg-accent flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left text-sm'
	>
		<span>{label}</span>
		{checked && (
			<svg viewBox='0 0 16 16' fill='none' className='size-3.5 shrink-0' aria-hidden>
				<path d='M3.5 8.5l3 3 6-7' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' />
			</svg>
		)}
	</button>
)

// The submenu is a plain hover/focus-driven panel rather than a nested
// Popover: Headless UI closes an inner Popover when the outer one owns focus,
// which would shut the panel on every checkbox click.
const Submenu = ({
	label,
	open,
	onOpen,
	children,
}: {
	readonly label: string
	readonly open: boolean
	readonly onOpen: () => void
	readonly children: React.ReactNode
}) => (
	<div className='relative' onMouseEnter={onOpen} onFocus={onOpen}>
		<button
			type='button'
			className={cn(
				'hover:bg-accent flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left text-sm',
				open && 'bg-accent',
			)}
		>
			<span>{label}</span>
			<svg viewBox='0 0 16 16' fill='none' className='size-3.5 shrink-0' aria-hidden>
				<path d='M6 3.5l4 4.5-4 4.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
			</svg>
		</button>

		{open && (
			<div className={cn(panelClasses, 'absolute top-0 left-full ml-1 max-h-[320px] min-w-[180px]')}>{children}</div>
		)}
	</div>
)

const Chip = ({ label, onRemove }: { readonly label: string; readonly onRemove: () => void }) => (
	<button
		type='button'
		onClick={onRemove}
		className='bg-secondary text-dim group flex h-9 items-center gap-1 px-2 text-sm font-normal'
	>
		<ClearIcon className='w-0 scale-0 transition-all group-hover:w-4 group-hover:scale-100' />
		<span>{label}</span>
	</button>
)

const toggle = <T,>(values: readonly T[] | undefined, value: T): readonly T[] | undefined => {
	const current = values ?? []
	const next = current.includes(value) ? current.filter(entry => entry !== value) : [...current, value]

	return next.length > 0 ? next : undefined
}

const TodoFilters = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/todos' })
	const search = useSearch({ from: '/_authenticated/$slug/todos' })
	const navigate = useNavigate()
	const tickets = useTickets(slug)

	const [term, setTerm] = useState(search.q ?? '')
	const [submenu, setSubmenu] = useState<string | undefined>(undefined)

	const setFilter = (patch: Partial<TodosSearch>) => {
		void navigate({ to: '.', search: (prev: TodosSearch) => ({ ...prev, ...patch }) })
	}

	const ticketTitle = (id: string): string =>
		tickets.status === 'ready' ? (tickets.tickets.find(entry => entry.id === id)?.title ?? id) : id

	const active = [
		search.ticket && { key: 'ticket', label: ticketTitle(search.ticket), clear: { ticket: undefined } },
		search.statuses && {
			key: 'statuses',
			label: search.statuses.map(status => TODO_STATUS_LABELS[status]).join(', '),
			clear: { statuses: undefined },
		},
		search.priority && { key: 'priority', label: search.priority, clear: { priority: undefined } },
		search.tags && { key: 'tags', label: search.tags.join(', '), clear: { tags: undefined } },
	].filter(entry => entry !== undefined && entry !== '')

	return (
		<div className='flex flex-wrap items-center gap-2'>
			<Popover className='relative'>
				<form
					className='relative'
					onSubmit={event => {
						event.preventDefault()
						setFilter({ q: term === '' ? undefined : term })
					}}
				>
					<span className='text-dim pointer-events-none absolute top-2.5 left-3'>
						<SearchIcon />
					</span>

					<input
						value={term}
						onChange={event => {
							setTerm(event.target.value)
							if (event.target.value === '') {
								setFilter({ q: undefined })
							}
						}}
						placeholder='Search todos...'
						autoComplete='off'
						spellCheck={false}
						className='border-border bg-transparent h-9 w-full border pr-9 pl-9 text-sm sm:w-[320px] focus:outline-hidden'
					/>

					<PopoverButton
						className={cn(
							'absolute top-2.5 right-3 opacity-50 transition-opacity duration-300 hover:opacity-100',
							active.length > 0 && 'opacity-100',
						)}
					>
						<FilterIcon />
					</PopoverButton>
				</form>

				<PopoverPanel
					anchor={{ to: 'bottom end', gap: 4 }}
					className={cn(panelClasses, 'min-w-[180px]')}
					onMouseLeave={() => {
						setSubmenu(undefined)
					}}
				>
					<Submenu
						label='Status'
						open={submenu === 'status'}
						onOpen={() => {
							setSubmenu('status')
						}}
					>
						{TODO_STATUSES.map(status => (
							<CheckItem
								key={status}
								label={TODO_STATUS_LABELS[status]}
								checked={search.statuses?.includes(status) ?? false}
								onToggle={() => {
									setFilter({ statuses: toggle<TodoStatus>(search.statuses, status) })
								}}
							/>
						))}
					</Submenu>

					<Submenu
						label='Priority'
						open={submenu === 'priority'}
						onOpen={() => {
							setSubmenu('priority')
						}}
					>
						{PRIORITIES.map(priority => (
							<CheckItem
								key={priority}
								label={priority}
								checked={search.priority === priority}
								onToggle={() => {
									setFilter({ priority: search.priority === priority ? undefined : (priority as Priority) })
								}}
							/>
						))}
					</Submenu>

					<Submenu
						label='Ticket'
						open={submenu === 'ticket'}
						onOpen={() => {
							setSubmenu('ticket')
						}}
					>
						<div className='max-h-[320px] overflow-y-auto'>
							{tickets.status === 'ready' && tickets.tickets.length === 0 && (
								<p className='text-dim px-3 py-1.5 text-sm'>No tickets</p>
							)}
							{tickets.status === 'ready' &&
								tickets.tickets.map(ticket => (
									<CheckItem
										key={ticket.id}
										label={ticket.title}
										checked={search.ticket === ticket.id}
										onToggle={() => {
											setFilter({ ticket: search.ticket === ticket.id ? undefined : ticket.id })
										}}
									/>
								))}
						</div>
					</Submenu>

					<Submenu
						label='Tags'
						open={submenu === 'tags'}
						onOpen={() => {
							setSubmenu('tags')
						}}
					>
						<div className='max-h-[320px] overflow-y-auto'>
							{[...CONTEXT_TAGS, ...KIND_TAGS].map(tag => (
								<CheckItem
									key={tag}
									label={tag}
									checked={search.tags?.includes(tag) ?? false}
									onToggle={() => {
										setFilter({ tags: toggle(search.tags, tag) })
									}}
								/>
							))}
						</div>
					</Submenu>
				</PopoverPanel>
			</Popover>

			{active.map(entry => (
				<Chip
					key={entry.key}
					label={entry.label}
					onRemove={() => {
						setFilter(entry.clear)
					}}
				/>
			))}
		</div>
	)
}

export { TodoFilters }
