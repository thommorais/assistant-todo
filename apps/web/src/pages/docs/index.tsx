import { useParams } from '@tanstack/react-router'
import { Badge } from '@thom/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@thom/ui/card'
import { useDocs } from '_/app/use-docs'

const Docs = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/docs' })
	const state = useDocs(slug)

	if (state.status === 'loading') {
		return (
			<div className='grid gap-4 sm:grid-cols-2'>
				{[0, 1].map(key => (
					<div key={key} className='border-border bg-accent/40 h-32 animate-pulse border' />
				))}
			</div>
		)
	}

	if (state.status === 'failed') {
		return <p className='text-destructive text-sm'>{state.message}</p>
	}

	if (state.docs.length === 0) {
		return <p className='text-dim text-sm'>No docs yet.</p>
	}

	return (
		<div className='grid gap-4 sm:grid-cols-2'>
			{state.docs.map(doc => (
				<Card key={doc.id} interactive>
					<CardHeader>
						<div className='flex items-start justify-between gap-4'>
							<CardTitle>{doc.title}</CardTitle>
							{doc.tags.map(tag => (
								<Badge key={tag} color='muted'>
									{tag}
								</Badge>
							))}
						</div>

						<CardDescription>{doc.body.slice(0, 140) || 'Empty.'}</CardDescription>
						<span className='text-dimmer pt-2 text-xs'>{doc.slug}</span>
					</CardHeader>
				</Card>
			))}
		</div>
	)
}

export { Docs }
