import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { cn } from '@thom/libs/cn'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@thom/ui/dropdown-menu'
import { useTickets } from '_/app/use-tickets'
import { PRIORITIES, TODO_STATUSES, type Priority, type TodoStatus } from '_/core/domain/todo'
import type { TodosSearch } from '_/routes/_authenticated/$slug/todos'
import { useState } from 'react'
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

const FilterMenuItem = ({ label, children }: { readonly label: string; readonly children: React.ReactNode }) => (
	<DropdownMenuGroup>
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<span>{label}</span>
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent sideOffset={14} alignOffset={-4} className='p-0'>
					{children}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	</DropdownMenuGroup>
)

const FilterCheckboxItem = ({
	label,
	checked,
	onCheckedChange,
}: {
	readonly label: string
	readonly checked: boolean
	readonly onCheckedChange: () => void
}) => (
	<DropdownMenuCheckboxItem
		checked={checked}
		onCheckedChange={onCheckedChange}
		// Selecting closes the menu by default, which would end a multi-select
		// after the first choice.
		onSelect={event => {
			event.preventDefault()
		}}
	>
		{label}
	</DropdownMenuCheckboxItem>
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

type ActiveFilter = {
	readonly key: string
	readonly label: string
	readonly clear: Partial<TodosSearch>
}

const TodoFilters = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/todos' })
	const search = useSearch({ from: '/_authenticated/$slug/todos' })
	const navigate = useNavigate()
	const tickets = useTickets(slug)

	const [term, setTerm] = useState(search.q ?? '')

	const setFilter = (patch: Partial<TodosSearch>) => {
		void navigate({ to: '.', search: (prev: TodosSearch) => ({ ...prev, ...patch }) })
	}

	const ticketTitle = (id: string): string =>
		tickets.status === 'ready' ? (tickets.tickets.find(entry => entry.id === id)?.title ?? id) : id

	const chips: ActiveFilter[] = []

	if (search.ticket !== undefined) {
		chips.push({ key: 'ticket', label: ticketTitle(search.ticket), clear: { ticket: undefined } })
	}
	if (search.statuses !== undefined) {
		chips.push({
			key: 'statuses',
			label: search.statuses.map(status => TODO_STATUS_LABELS[status]).join(', '),
			clear: { statuses: undefined },
		})
	}
	if (search.priority !== undefined) {
		chips.push({ key: 'priority', label: search.priority, clear: { priority: undefined } })
	}
	if (search.tags !== undefined) {
		chips.push({ key: 'tags', label: search.tags.join(', '), clear: { tags: undefined } })
	}

	return (
		<DropdownMenu>
			<div className='flex flex-wrap items-center gap-2'>
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
						autoCapitalize='none'
						autoCorrect='off'
						spellCheck={false}
						className='border-border h-9 w-full border bg-transparent pr-9 pl-9 text-sm focus:outline-hidden sm:w-[320px]'
					/>

					<DropdownMenuTrigger asChild>
						<button
							type='button'
							className={cn(
								'absolute top-2.5 right-3 z-10 opacity-50 transition-opacity duration-300 hover:opacity-100',
								chips.length > 0 && 'opacity-100',
							)}
						>
							<FilterIcon />
						</button>
					</DropdownMenuTrigger>
				</form>

				{chips.map(chip => (
					<Chip
						key={chip.key}
						label={chip.label}
						onRemove={() => {
							setFilter(chip.clear)
						}}
					/>
				))}
			</div>

			<DropdownMenuContent className='w-[220px]' align='end' sideOffset={19} alignOffset={-11} side='bottom'>
				<FilterMenuItem label='Status'>
					{TODO_STATUSES.map(status => (
						<FilterCheckboxItem
							key={status}
							label={TODO_STATUS_LABELS[status]}
							checked={search.statuses?.includes(status) ?? false}
							onCheckedChange={() => {
								setFilter({ statuses: toggle<TodoStatus>(search.statuses, status) })
							}}
						/>
					))}
				</FilterMenuItem>

				<FilterMenuItem label='Priority'>
					{PRIORITIES.map(priority => (
						<FilterCheckboxItem
							key={priority}
							label={priority}
							checked={search.priority === priority}
							onCheckedChange={() => {
								setFilter({ priority: search.priority === priority ? undefined : (priority as Priority) })
							}}
						/>
					))}
				</FilterMenuItem>

				<FilterMenuItem label='Ticket'>
					<div className='max-h-[300px] overflow-y-auto'>
						{tickets.status === 'ready' && tickets.tickets.length === 0 && (
							<DropdownMenuItem disabled>No tickets found</DropdownMenuItem>
						)}
						{tickets.status === 'ready' &&
							tickets.tickets.map(ticket => (
								<FilterCheckboxItem
									key={ticket.id}
									label={ticket.title}
									checked={search.ticket === ticket.id}
									onCheckedChange={() => {
										setFilter({ ticket: search.ticket === ticket.id ? undefined : ticket.id })
									}}
								/>
							))}
					</div>
				</FilterMenuItem>

				<FilterMenuItem label='Tags'>
					<div className='max-h-[300px] overflow-y-auto'>
						{[...CONTEXT_TAGS, ...KIND_TAGS].map(tag => (
							<FilterCheckboxItem
								key={tag}
								label={tag}
								checked={search.tags?.includes(tag) ?? false}
								onCheckedChange={() => {
									setFilter({ tags: toggle(search.tags, tag) })
								}}
							/>
						))}
					</div>
				</FilterMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export { TodoFilters }
