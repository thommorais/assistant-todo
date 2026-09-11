import { Link, useParams } from '@tanstack/react-router'
import { cn } from '@thom/libs/cn'
import { Badge } from '@thom/ui/badge'
import { useTickets } from '_/app/use-tickets'
import { isTerminal, type TicketStatus } from '_/core/domain/ticket'

const statusLabels: Record<TicketStatus, string> = {
	open: 'Open',
	in_progress: 'In progress',
	blocked: 'Blocked',
	closed: 'Closed',
	cancelled: 'Cancelled',
}

const Tickets = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/tickets/' })
	const state = useTickets(slug)

	if (state.status === 'loading') {
		return (
			<div className='border-border divide-border divide-y border'>
				{[0, 1].map(key => (
					<div key={key} className='bg-accent/40 h-20 animate-pulse' />
				))}
			</div>
		)
	}

	if (state.status === 'failed') {
		return <p className='text-destructive text-sm'>{state.message}</p>
	}

	if (state.tickets.length === 0) {
		return <p className='text-dim text-sm'>No tickets yet.</p>
	}

	return (
		<div className='border-border divide-border divide-y border'>
			{state.tickets.map(ticket => (
				<article key={ticket.id} className='space-y-2 px-4 py-4'>
					<div className='flex items-start justify-between gap-4'>
						<Link
							to='/$slug/tickets/$ticket'
							params={{ slug, ticket: ticket.slug }}
							className={cn('text-sm font-medium hover:underline', isTerminal(ticket.status) && 'text-dim')}
						>
							{ticket.title}
						</Link>
						<span className='text-dim shrink-0 text-xs'>{statusLabels[ticket.status]}</span>
					</div>

					{ticket.body && <p className='text-dim line-clamp-2 text-sm'>{ticket.body}</p>}

					<div className='flex flex-wrap items-center gap-2 pt-1'>
						<span className='text-dimmer font-mono text-xs'>{ticket.priority}</span>
						{ticket.externalRef && <span className='text-dimmer font-mono text-xs'>{ticket.externalRef}</span>}
						{ticket.tags.map(tag => (
							<Badge key={tag} color='muted'>
								{tag}
							</Badge>
						))}
					</div>
				</article>
			))}
		</div>
	)
}

export { Tickets }
