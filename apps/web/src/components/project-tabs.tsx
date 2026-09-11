import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@thom/libs/cn'

const tabs = [
	{ to: '/$slug', label: 'Overview', exact: true },
	{ to: '/$slug/tickets', label: 'Tickets', exact: false },
	{ to: '/$slug/plans', label: 'Plans', exact: false },
	{ to: '/$slug/todos', label: 'Todos', exact: false },
	{ to: '/$slug/logs', label: 'Logs', exact: false },
	{ to: '/$slug/docs', label: 'Docs', exact: false },
] as const

export const ProjectTabs = ({ slug }: { slug: string }) => {
	const { location } = useRouterState()

	return (
		<nav className='border-border flex gap-6 border-b'>
			{tabs.map(({ to, label, exact }) => {
				const href = to.replace('$slug', slug)
				const isActive = exact ? location.pathname === href : location.pathname.startsWith(href)

				return (
					<Link
						key={to}
						to={to}
						params={{ slug }}
						className={cn(
							'-mb-px border-b-2 pb-2 text-sm transition-colors',
							isActive ? 'border-foreground text-foreground' : 'text-dim hover:text-foreground border-transparent',
						)}
					>
						{label}
					</Link>
				)
			})}
		</nav>
	)
}
