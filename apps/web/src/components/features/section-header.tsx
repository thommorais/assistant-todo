import { Navbar, NavbarItem, NavbarSection } from '@thom/ui/navbar'
import { useIsCurrentPath } from '_/hooks/use-is-current-path'
import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import { type ReactNode, useEffect, useRef } from 'react'

export type Breadcrumb = {
	readonly label: string
	readonly href?: string
}

export type SectionTab = {
	readonly path: string
	readonly exact?: boolean
	readonly label: string
}

const Breadcrumbs = ({ items }: { items: ReadonlyArray<Breadcrumb> }) => {
	return (
		<nav aria-label='Breadcrumb'>
			<ol className='flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground'>
				{items.map((item, index) => (
					<li key={item.label} className='flex items-center gap-1'>
						{index > 0 ? <ChevronRight aria-hidden className='size-3 opacity-60' /> : null}
						{item.href ? (
							<NextLink href={item.href} className='transition-colors hover:text-foreground'>
								{item.label}
							</NextLink>
						) : (
							<span>{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}

const SectionTabs = ({ links }: { links: ReadonlyArray<SectionTab> }) => {
	const isCurrentPath = useIsCurrentPath()
	const activeRef = useRef<HTMLDivElement | null>(null)

	// Bring the active tab into view: on a phone the strip scrolls, and the
	// current section is often one of the trailing tabs, off-screen on load.
	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
	}, [])

	return (
		// The tab row scrolls sideways rather than wrapping or clipping: on a phone
		// the finance section has more tabs than fit, and the trailing ones were
		// unreachable. `scrollbar-none` keeps the affordance from eating height.
		<div className='overflow-x-auto border-b border-border/60 scrollbar-none'>
			<Navbar className='w-max gap-1 lg:gap-3'>
				<NavbarSection className='gap-1 lg:gap-3'>
					{links.map(link => {
						const current = isCurrentPath(link.path, link.exact)
						return (
							<div key={link.path} className='shrink-0' ref={current ? activeRef : undefined}>
								<NavbarItem
									className='whitespace-nowrap'
									LinkComponent={NextLink}
									href={link.path}
									current={current}
								>
									{link.label}
								</NavbarItem>
							</div>
						)
					})}
				</NavbarSection>
			</Navbar>
		</div>
	)
}

type SectionHeaderProps = {
	/** Ancestor trail shown above the title. The current page is the title, not a crumb. */
	readonly breadcrumbs: ReadonlyArray<Breadcrumb>
	readonly title: string
	readonly action?: ReactNode
	/** Tab destinations for this section; omit for focused sub-flows (forms). */
	readonly tabs?: ReadonlyArray<SectionTab>
}

/**
 * Page header shared across features, after securo's PageHeader: a breadcrumb
 * trail over the page title, right-aligned actions, and an optional tab bar.
 */
export const SectionHeader = ({ breadcrumbs, title, action, tabs }: SectionHeaderProps) => {
	return (
		<div className='flex flex-col gap-4 pt-6'>
			<div className='flex flex-col gap-1'>
				<Breadcrumbs items={breadcrumbs} />
				{/* Wraps only when it has to: a compact action (a single button) stays
				 * beside the title, while wide ones (the reports range/interval
				 * controls) drop to their own line instead of truncating the title. */}
				<div className='flex flex-wrap items-start justify-between gap-x-3 gap-y-2'>
					<h1 className='min-w-0 text-2xl font-semibold tracking-tight text-foreground'>{title}</h1>
					{action ? <div className='flex flex-wrap items-center gap-2'>{action}</div> : null}
				</div>
			</div>
			{tabs && tabs.length > 0 ? <SectionTabs links={tabs} /> : null}
		</div>
	)
}
