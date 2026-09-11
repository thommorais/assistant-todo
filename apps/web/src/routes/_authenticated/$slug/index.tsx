import { createFileRoute } from '@tanstack/react-router'
import { Card, CardDescription, CardHeader, CardTitle } from '@thom/ui/card'

const counts = [
	{ label: 'Plans', value: '3' },
	{ label: 'Todos', value: '13' },
	{ label: 'Logs', value: '6' },
	{ label: 'Docs', value: '3' },
]

const Overview = () => (
	<div className='space-y-6'>
		<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{counts.map(({ label, value }) => (
				<Card key={label}>
					<CardHeader>
						<span className='text-dim text-xs'>{label}</span>
						<span className='font-serif text-2xl'>{value}</span>
					</CardHeader>
				</Card>
			))}
		</div>

		<Card>
			<CardHeader>
				<CardTitle>Active plan</CardTitle>
				<CardDescription>Ship full text search</CardDescription>

				<div className='pt-4'>
					<div className='bg-accent h-1 w-full'>
						<div className='bg-foreground h-1' style={{ width: '40%' }} />
					</div>
					<span className='text-dimmer pt-2 text-xs'>2 of 5 done</span>
				</div>
			</CardHeader>
		</Card>
	</div>
)

export const Route = createFileRoute('/_authenticated/$slug/')({
	component: Overview,
})
