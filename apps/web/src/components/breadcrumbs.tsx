import { Link, useMatches, useParams } from '@tanstack/react-router'
import { House } from 'lucide-react'
import { useTicket } from '_/app/use-ticket'

const sectionLabels: Record<string, string> = {
	tickets: 'Tickets',
	plans: 'Plans',
	todos: 'Todos',
	journal: 'Journal',
	docs: 'Docs',
}

type Crumb = {
	readonly key: string
	readonly label: React.ReactNode
	readonly title: string
	readonly to?: string
	readonly params?: Record<string, string>
}

const Separator = () => (
	<span aria-hidden className='select-none'>
		/
	</span>
)

// The ticket title only exists after its fetch resolves, so the leaf crumb
// falls back to the slug already in the URL rather than collapsing the trail.
const useTicketLabel = (slug: string | undefined, ticket: string | undefined) => {
	const state = useTicket(slug ?? '', ticket ?? '')

	if (slug === undefined || ticket === undefined) return undefined

	return state.status === 'ready' ? state.ticket.title : ticket
}

export const Breadcrumbs = () => {
	const matches = useMatches()
	const params = useParams({ strict: false })
	const slug = typeof params.slug === 'string' ? params.slug : undefined
	const ticket = typeof params.ticket === 'string' ? params.ticket : undefined
	const ticketLabel = useTicketLabel(slug, ticket)

	const routeId = matches.at(-1)?.routeId ?? ''
	const section = Object.keys(sectionLabels).find(name => routeId.includes(`/$slug/${name}`))

	const crumbs: Crumb[] = [
		{ key: 'root', label: <House size={14} aria-label='Projects' />, title: 'Projects', to: '/' },
	]

	if (slug !== undefined) {
		crumbs.push({ key: 'project', label: slug, title: slug, to: '/$slug', params: { slug } })
	}

	if (section !== undefined && slug !== undefined) {
		crumbs.push({
			key: 'section',
			label: sectionLabels[section] as string,
			title: sectionLabels[section] as string,
			to: `/$slug/${section}`,
			params: { slug },
		})
	}

	if (ticketLabel !== undefined) {
		crumbs.push({ key: 'ticket', label: ticketLabel, title: ticketLabel })
	}

	return (
		<nav aria-label='Breadcrumb' className='text-dim flex min-w-0 items-center gap-2 text-xs tracking-widest uppercase'>
			{crumbs.map((crumb, index) => {
				const isLast = index === crumbs.length - 1

				return (
					<span key={crumb.key} className='flex min-w-0 items-center gap-2'>
						{index > 0 && <Separator />}

						{isLast || crumb.to === undefined ? (
							<span className='text-foreground truncate' aria-current='page'>
								{crumb.label}
							</span>
						) : (
							<Link
								to={crumb.to}
								params={crumb.params}
								title={crumb.title}
								className='hover:text-foreground flex shrink-0 items-center transition-colors'
							>
								{crumb.label}
							</Link>
						)}
					</span>
				)
			})}
		</nav>
	)
}
