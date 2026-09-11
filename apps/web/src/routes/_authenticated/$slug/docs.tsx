import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@thom/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@thom/ui/card'

const docs = [
	{
		slug: 'architecture',
		title: 'Architecture',
		descr: 'One Go core holds the domain and use cases; adapters mount it.',
		tags: ['reference'],
	},
	{
		slug: 'api-contracts',
		title: 'API contracts',
		descr: 'REST shapes for projects, plans, todos, logs and docs.',
		tags: ['reference'],
	},
	{
		slug: 'search-design',
		title: 'Search design',
		descr: 'FTS5 per kind, merged newest first, snippets cut on a word boundary.',
		tags: ['search'],
	},
]

const Docs = () => (
	<div className='grid gap-4 sm:grid-cols-2'>
		{docs.map(doc => (
			<Card key={doc.slug} interactive>
				<CardHeader>
					<div className='flex items-start justify-between gap-4'>
						<CardTitle>{doc.title}</CardTitle>
						{doc.tags.map(tag => (
							<Badge key={tag} color='muted'>
								{tag}
							</Badge>
						))}
					</div>

					<CardDescription>{doc.descr}</CardDescription>
					<span className='text-dimmer pt-2 text-xs'>{doc.slug}</span>
				</CardHeader>
			</Card>
		))}
	</div>
)

export const Route = createFileRoute('/_authenticated/$slug/docs')({
	component: Docs,
})
