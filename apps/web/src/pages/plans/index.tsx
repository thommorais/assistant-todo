import { useParams } from '@tanstack/react-router'
import { cn } from '@thom/libs/cn'
import { Badge } from '@thom/ui/badge'
import { usePlans } from '_/app/use-plans'
import type { PlanStatus } from '_/core/domain/plan'

const statusLabels: Record<PlanStatus, string> = {
	draft: 'Draft',
	active: 'Active',
	done: 'Done',
	abandoned: 'Abandoned',
}

const Plans = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/plans' })
	const state = usePlans(slug)

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

	if (state.plans.length === 0) {
		return <p className='text-dim text-sm'>No plans yet.</p>
	}

	return (
		<div className='border-border divide-border divide-y border'>
			{state.plans.map(plan => (
				<article key={plan.id} className='space-y-2 px-4 py-4'>
					<div className='flex items-start justify-between gap-4'>
						<h3 className={cn('text-sm font-medium', plan.status === 'done' && 'text-dim line-through')}>
							{plan.title}
						</h3>
						<span className='text-dim shrink-0 text-xs'>{statusLabels[plan.status]}</span>
					</div>

					{plan.goal && <p className='text-dim text-sm'>{plan.goal}</p>}

					{plan.tags.length > 0 && (
						<div className='flex flex-wrap items-center gap-2 pt-1'>
							{plan.tags.map(tag => (
								<Badge key={tag} color='muted'>
									{tag}
								</Badge>
							))}
						</div>
					)}
				</article>
			))}
		</div>
	)
}

export { Plans }
