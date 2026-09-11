import { Link, useRouterState } from '@tanstack/react-router'
import { FolderKanban, Search, Settings } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@thom/libs/cn'
import { useSearchStore } from '_/app/search-store'
import { OpenSearchButton } from './search/open-search-button'
import { SearchModal } from './search/search-modal'
import { UserMenu } from './user-menu'

type NavItem = {
	readonly to?: '/'
	readonly label: string
	readonly Icon: typeof FolderKanban
	readonly opensSearch?: boolean
}

const items: readonly NavItem[] = [
	{ to: '/', label: 'Projects', Icon: FolderKanban },
	{ label: 'Search', Icon: Search, opensSearch: true },
	{ label: 'Settings', Icon: Settings },
]

const Sidebar = () => {
	const [isExpanded, setExpanded] = useState(false)
	const { location } = useRouterState()
	const setSearchOpen = useSearchStore(state => state.setOpen)

	return (
		<aside
			onMouseEnter={() => setExpanded(true)}
			onMouseLeave={() => setExpanded(false)}
			className={cn(
				'border-border bg-background fixed top-0 z-50 hidden h-dvh flex-shrink-0 flex-col justify-between border-r pb-4 transition-all duration-200 md:flex',
				isExpanded ? 'w-[240px]' : 'w-[70px]',
			)}
		>
			<div
				className={cn(
					'border-border bg-background absolute top-0 left-0 flex h-[70px] items-center border-b transition-all duration-200',
					isExpanded ? 'w-full' : 'w-[69px]',
				)}
			>
				<Link to='/' className='absolute left-[22px] font-serif text-base'>
					j
				</Link>
			</div>

			<nav className='mt-4 flex w-full flex-1 flex-col gap-2 pt-[70px]'>
				{items.map(({ to, label, Icon, opensSearch }) => {
					const isActive = to !== undefined && location.pathname === to
					const body = (
						<>
							<div
								className={cn(
									'mx-[15px] h-[40px] border border-transparent transition-all duration-200',
									isActive && 'border-border bg-accent/60',
									isExpanded ? 'w-[calc(100%-30px)]' : 'w-[40px]',
								)}
							/>

							<div className='text-dim group-hover:text-foreground pointer-events-none absolute top-0 left-[15px] flex size-[40px] items-center justify-center'>
								<Icon size={20} className={cn(isActive && 'text-foreground')} />
							</div>

							{isExpanded && (
								<div className='pointer-events-none absolute top-0 left-[55px] flex h-[40px] items-center'>
									<span
										className={cn(
											'text-dim group-hover:text-foreground text-sm font-medium whitespace-nowrap',
											isActive && 'text-foreground',
										)}
									>
										{label}
									</span>
								</div>
							)}
						</>
					)

					if (opensSearch) {
						return (
							<button
								key={label}
								type='button'
								aria-label={label}
								onClick={() => setSearchOpen(true)}
								className='group relative block cursor-pointer'
							>
								{body}
							</button>
						)
					}

					if (to === undefined) {
						return (
							<div key={label} aria-disabled='true' className='group relative block opacity-40'>
								{body}
							</div>
						)
					}

					return (
						<Link key={label} to={to} className='group relative block'>
							{body}
						</Link>
					)
				})}
			</nav>
		</aside>
	)
}

const Header = () => (
	<header className='border-border group flex h-[70px] items-center justify-between border-b px-6'>
		<OpenSearchButton />

		<div className='ml-auto flex items-center space-x-2'>
			<UserMenu />
		</div>
	</header>
)

export const AppShell = ({ children }: { children: React.ReactNode }) => (
	<div className='bg-background relative flex min-h-dvh w-full'>
		<Sidebar />

		<div className='flex flex-1 flex-col md:ml-[70px]'>
			<Header />
			<main className='flex-1 px-6 py-8'>{children}</main>
		</div>

		<SearchModal />
	</div>
)
