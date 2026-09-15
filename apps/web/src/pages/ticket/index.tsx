import { Link, useParams } from '@tanstack/react-router'
import { cn } from '@thom/libs/cn'
import { Badge } from '@thom/ui/badge'
import { Heading } from '@thom/ui/heading'
import { useDocs } from '_/app/use-docs'
import { useJournal } from '_/app/use-journal'
import { usePlans } from '_/app/use-plans'
import { useTicket } from '_/app/use-ticket'
import { useTodos } from '_/app/use-todos'
import type { TicketStatus } from '_/core/domain/ticket'
import { TODO_STATUS_LABELS } from '_/pages/todos/status-labels'

const statusLabels: Record<TicketStatus, string> = {
	open: 'Open',
	in_progress: 'In progress',
	blocked: 'Blocked',
	closed: 'Closed',
	cancelled: 'Cancelled',
}

// Each section lists the ticket's own slice of an entity. The hooks take the
// ticket id, so a ticket with no work of a given kind renders nothing rather
// than the project's whole list.
const Section = ({ title, children }: { readonly title: string; readonly children: React.ReactNode }) => (
	<section className='space-y-2'>
		<h2 className='text-dim text-xs tracking-wide uppercase'>{title}</h2>
		{children}
	</section>
)

const Empty = ({ what }: { readonly what: string }) => <p className='text-dim text-sm'>No {what} on this ticket.</p>

const TicketDetail = () => {
	const { slug, ticket: ticketSlug } = useParams({ from: '/_authenticated/$slug/tickets/$ticket' })
	const state = useTicket(slug, ticketSlug)

	if (state.status === 'loading') {
		return <div className='bg-accent/40 h-32 animate-pulse' />
	}

	if (state.status === 'failed') {
		return <p className='text-destructive text-sm'>{state.message}</p>
	}

	return <TicketBody project={slug} ticket={state.ticket} />
}

type BodyProps = {
	readonly project: string
	readonly ticket: import('_/core/domain/ticket').Ticket
}

const TicketBody = ({ project, ticket }: BodyProps) => {
	const ticketId = ticket.id
	const plans = usePlans(project, { ticketId })
	const todos = useTodos(project, { ticketId })
	const journal = useJournal(project, { ticketId })
	const docs = useDocs(project, { ticketId })

	return (
		<div className='space-y-8'>
			<header className='space-y-3'>
				<Heading>{ticket.title}</Heading>

				<div className='flex flex-wrap items-center gap-2'>
					<span className='text-dim text-xs'>{statusLabels[ticket.status]}</span>
					<span className='text-dimmer font-mono text-xs'>{ticket.priority}</span>
					{ticket.externalRef && <span className='text-dimmer font-mono text-xs'>{ticket.externalRef}</span>}
					{ticket.tags.map(tag => (
						<Badge key={tag} color='muted'>
							{tag}
						</Badge>
					))}
				</div>

				{ticket.body && <p className='text-dim text-sm whitespace-pre-line'>{ticket.body}</p>}
			</header>

			<Section title='Plans'>
				{plans.status === 'ready' && plans.plans.length === 0 && <Empty what='plans' />}
				{plans.status === 'ready' && plans.plans.length > 0 && (
					<ul className='border-border divide-border divide-y border'>
						{plans.plans.map(plan => (
							<li key={plan.id} className='flex items-center justify-between gap-4 px-4 py-3 text-sm'>
								<span>{plan.title}</span>
								<span className='text-dim shrink-0 text-xs'>{plan.status}</span>
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section title='Todos'>
				{todos.status === 'ready' && todos.todos.length === 0 && <Empty what='todos' />}
				{todos.status === 'ready' && todos.todos.length > 0 && (
					<ul className='border-border divide-border divide-y border'>
						{todos.todos.map(todo => (
							<li key={todo.id}>
								<Link
									to='/$slug/todos'
									params={{ slug: project }}
									search={{ todo: todo.id }}
									className='hover:bg-accent/40 flex w-full items-center gap-3 px-4 py-3 transition-colors'
								>
									<span
										className={cn(
											'border-border size-4 shrink-0 border',
											todo.status === 'done' && 'bg-foreground border-foreground',
										)}
									/>

									<span className={cn('flex-1 truncate text-sm', todo.status === 'done' && 'text-dim line-through')}>
										{todo.title}
									</span>

									{todo.status === 'blocked' && <Badge color='destructive'>Blocked</Badge>}

									<span className='hidden shrink-0 items-center gap-3 sm:flex'>
										{todo.tags.map(tag => (
											<Badge key={tag} color='muted'>
												{tag}
											</Badge>
										))}
									</span>

									<span className='text-dimmer hidden w-16 shrink-0 text-right text-xs sm:block'>{todo.priority}</span>
									<span className='text-dim w-24 shrink-0 text-right text-xs'>{TODO_STATUS_LABELS[todo.status]}</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section title='Journal'>
				{journal.status === 'ready' && journal.journal.length === 0 && <Empty what='journal entries' />}
				{journal.status === 'ready' && journal.journal.length > 0 && (
					<ul className='border-border divide-border divide-y border'>
						{journal.journal.map(entry => (
							<li key={entry.id} className='px-4 py-3 text-sm'>
								{entry.title}
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section title='Docs'>
				{docs.status === 'ready' && docs.docs.length === 0 && <Empty what='docs' />}
				{docs.status === 'ready' && docs.docs.length > 0 && (
					<ul className='border-border divide-border divide-y border'>
						{docs.docs.map(doc => (
							<li key={doc.id} className='flex items-center justify-between gap-4 px-4 py-3 text-sm'>
								<span>{doc.title}</span>
								<span className='text-dimmer font-mono text-xs'>{doc.slug}</span>
							</li>
						))}
					</ul>
				)}
			</Section>
		</div>
	)
}

export { TicketDetail }
