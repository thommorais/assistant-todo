import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@thom/ui/badge'

const logs = [
	{
		title: 'Chose SQLite FTS5 over a separate search service',
		snippet:
			'Search has to span logs, docs, todos and plans, scoped to one project, and stay useful at the volume an agent generates.',
		branch: 'feat/search',
		ticket: 'JOURN-12',
		tags: ['decision', 'architecture'],
		date: '11 Sep',
	},
	{
		title: 'Search repository landed, benchmarks pending',
		snippet: 'One filtered query per kind, merged and sorted newest first, paged after the merge.',
		branch: 'feat/search',
		ticket: '',
		tags: ['search'],
		date: '11 Sep',
	},
	{
		title: 'Collection rules could not reference journ_members at create time',
		snippet: 'Boot failed because the migration created projects before the membership collection existed.',
		branch: 'feat/schema',
		ticket: '',
		tags: ['bugfix'],
		date: '10 Sep',
	},
]

const Logs = () => (
	<div className='border-border divide-border divide-y border'>
		{logs.map(log => (
			<article key={log.title} className='space-y-2 px-4 py-4'>
				<div className='flex items-start justify-between gap-4'>
					<h3 className='text-sm font-medium'>{log.title}</h3>
					<span className='text-dimmer shrink-0 text-xs'>{log.date}</span>
				</div>

				<p className='text-dim line-clamp-2 text-sm'>{log.snippet}</p>

				<div className='flex flex-wrap items-center gap-2 pt-1'>
					<span className='text-dimmer font-mono text-xs'>{log.branch}</span>
					{log.ticket && <span className='text-dimmer font-mono text-xs'>{log.ticket}</span>}
					{log.tags.map(tag => (
						<Badge key={tag} color='muted'>
							{tag}
						</Badge>
					))}
				</div>
			</article>
		))}
	</div>
)

export const Route = createFileRoute('/_authenticated/$slug/logs')({
	component: Logs,
})
