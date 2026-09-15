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
	<div className='bg-background relative flex min-h-dvh w-full flex-col'>
		<Header />
		<main className='min-w-0 flex-1 px-4 py-8 md:px-6'>{children}</main>

		<SearchModal />
	</div>
)
