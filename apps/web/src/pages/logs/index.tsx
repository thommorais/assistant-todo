import { useParams, useSearch } from '@tanstack/react-router'
import { Badge } from '@thom/ui/badge'
import { useLogs } from '_/app/use-logs'
import { LogsFilters } from './log-filters'

const dayMonth = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' })

const Logs = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/logs' })
	const search = useSearch({ from: '/_authenticated/$slug/logs' })
	const state = useLogs(slug, {
		ticketId: search.ticket,
		tags: search.tags,
		search: search.q,
		sort: search.sort,
	})

	const filtered = search.q !== undefined || search.tags !== undefined || search.ticket !== undefined

	const list = (() => {
		if (state.status === 'loading') {
			return (
			<div className='border-border divide-border divide-y border'>
				{[0, 1, 2].map(key => (
					<div key={key} className='bg-accent/40 h-24 animate-pulse' />
				))}
			</div>
		)
	}

		if (state.status === 'failed') {
			return <p className='text-destructive text-sm'>{state.message}</p>
		}

		if (state.logs.length === 0) {
			return <p className='text-dim text-sm'>{filtered ? 'No logs match.' : 'No logs yet.'}</p>
		}

		return (
		<div className='border-border divide-border divide-y border'>
			{state.logs.map(entry => (
				<article key={entry.id} className='space-y-2 px-4 py-4'>
					<div className='flex items-start justify-between gap-4'>
						<h3 className='text-sm font-medium'>{entry.title}</h3>
						<span className='text-dimmer shrink-0 text-xs'>{dayMonth.format(entry.createdAt)}</span>
					</div>

					{entry.body && <p className='text-dim line-clamp-2 text-sm'>{entry.body}</p>}

					<div className='flex flex-wrap items-center gap-2 pt-1'>
						{entry.branch && <span className='text-dimmer font-mono text-xs'>{entry.branch}</span>}
						{entry.externalRef && <span className='text-dimmer font-mono text-xs'>{entry.externalRef}</span>}
						{entry.pr && <span className='text-dimmer font-mono text-xs'>#{entry.pr}</span>}
						{entry.tags.map(tag => (
							<Badge key={tag} color='muted'>
								{tag}
							</Badge>
						))}
					</div>
				</article>
			))}
		</div>
		)
	})()

	return (
		<div className='space-y-4'>
			<LogsFilters />
			{list}
		</div>
	)
}

export { Logs }
