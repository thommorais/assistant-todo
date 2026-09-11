import { createFileRoute, useParams } from '@tanstack/react-router'
import { Badge } from '@thom/ui/badge'
import { cn } from '@thom/libs/cn'
import type { TodoStatus } from '_/core/domain/todo'
import { useTodos } from '_/app/use-todos'

const statusLabels: Record<TodoStatus, string> = {
	pending: 'Pending',
	in_progress: 'In progress',
	done: 'Done',
	blocked: 'Blocked',
	cancelled: 'Cancelled',
}

const Todos = () => {
	const { slug } = useParams({ from: '/_authenticated/$slug/todos' })
	const state = useTodos(slug)

	if (state.status === 'loading') {
		return (
			<div className='border-border divide-border divide-y border'>
				{[0, 1, 2].map(key => (
					<div key={key} className='bg-accent/40 h-[45px] animate-pulse' />
				))}
			</div>
		)
	}

	if (state.status === 'failed') {
		return <p className='text-destructive text-sm'>{state.message}</p>
	}

	if (state.todos.length === 0) {
		return <p className='text-dim text-sm'>No todos yet.</p>
	}

	return (
		<ul className='border-border divide-border divide-y border'>
			{state.todos.map(todo => (
				<li key={todo.id} className='flex items-center gap-3 px-4 py-3'>
					<span
						className={cn(
							'border-border size-4 shrink-0 border',
							todo.status === 'done' && 'bg-foreground border-foreground',
						)}
					/>

					<span className={cn('flex-1 truncate text-sm', todo.status === 'done' && 'text-dim line-through')}>
						{todo.title}
					</span>

					{todo.blocked && <Badge color='destructive'>Blocked</Badge>}

					{todo.tags.map(tag => (
						<Badge key={tag} color='muted'>
							{tag}
						</Badge>
					))}

					<span className='text-dimmer w-20 shrink-0 text-right text-xs'>{todo.priority}</span>
					<span className='text-dim w-24 shrink-0 text-right text-xs'>{statusLabels[todo.status]}</span>
				</li>
			))}
		</ul>
	)
}

export const Route = createFileRoute('/_authenticated/$slug/todos')({
	component: Todos,
})
