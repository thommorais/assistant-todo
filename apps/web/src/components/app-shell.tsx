import { Link, useRouterState } from '@tanstack/react-router'
import { FolderKanban, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@thom/libs/cn'
import { Sheet, SheetContent } from '@thom/ui/sheet'
import { useSearchStore } from '_/app/search-store'
import { OpenSearchButton } from './search/open-search-button'
import { SearchModal } from './search/search-modal'
import { UserMenu } from './user-menu'

type NavItem = {
	readonly to: '/'
	readonly label: string
	readonly Icon: typeof FolderKanban
}

const items: readonly NavItem[] = [{ to: '/', label: 'Projects', Icon: FolderKanban }]

const NavLinks = ({ onSelect }: { readonly onSelect?: () => void }) => {
	const { location } = useRouterState()

	return (
		<nav className='flex flex-col gap-1'>
			{items.map(({ to, label, Icon }) => {
				const isActive = location.pathname === to

				return (
					<Link
						key={label}
						to={to}
						onClick={onSelect}
						className={cn(
							'text-dim hover:text-foreground flex h-10 items-center gap-3 px-3 text-sm font-medium',
							isActive && 'border-border bg-accent/60 text-foreground border',
						)}
					>
						<Icon size={20} />
						<span>{label}</span>
					</Link>
				)
			})}
		</nav>
	)
}

const MobileMenu = () => {
	const [isOpen, setOpen] = useState(false)
	const setSearchOpen = useSearchStore(state => state.setOpen)

	return (
		<Sheet open={isOpen} onOpenChange={setOpen}>
			<button
				type='button'
				aria-label='Open menu'
				onClick={() => setOpen(true)}
				className='border-border flex size-8 items-center justify-center border md:hidden'
			>
				<Menu size={16} />
			</button>

			<SheetContent side='left' title='Menu' className='p-4'>
				<Link to='/' onClick={() => setOpen(false)} className='mb-8 block font-serif text-base'>
					folio
				</Link>

				<NavLinks onSelect={() => setOpen(false)} />

				<button
					type='button'
					onClick={() => {
						setOpen(false)
						setSearchOpen(true)
					}}
					className='text-dim hover:text-foreground mt-1 flex h-10 w-full items-center gap-3 px-3 text-sm font-medium'
				>
					<Search size={20} />
					<span>Search</span>
				</button>
			</SheetContent>
		</Sheet>
	)
}

const Sidebar = () => {
	const [isExpanded, setExpanded] = useState(false)
	const { location } = useRouterState()

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
					f
				</Link>
			</div>

			<nav className='mt-4 flex w-full flex-1 flex-col gap-2 pt-[70px]'>
				{items.map(({ to, label, Icon }) => {
					const isActive = location.pathname === to

					return (
						<Link key={label} to={to} className='group relative block'>
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
						</Link>
					)
				})}
			</nav>
		</aside>
	)
}

const Header = () => (
	<header className='border-border group flex h-[70px] items-center justify-between border-b px-4 md:px-6'>
		<MobileMenu />
		<OpenSearchButton />

		<div className='ml-auto flex items-center space-x-2'>
			<UserMenu />
		</div>
	</header>
)

export const AppShell = ({ children }: { children: React.ReactNode }) => (
	<div className='bg-background relative flex min-h-dvh w-full'>
		<Sidebar />

		<div className='flex min-w-0 flex-1 flex-col md:ml-[70px]'>
			<Header />
			<main className='min-w-0 flex-1 px-4 py-8 md:px-6'>{children}</main>
		</div>

		<SearchModal />
	</div>
)
