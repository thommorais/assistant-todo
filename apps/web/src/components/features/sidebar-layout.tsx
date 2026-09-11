import { Avatar } from '@thom/ui/avatar'
import { Button } from '@thom/ui/button'
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@thom/ui/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@thom/ui/navbar'
import {
	Sidebar,
	SidebarBody,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarLabel,
	SidebarSection,
	SidebarSpacer,
} from '@thom/ui/sidebar'
import { SidebarLayout } from '@thom/ui/sidebar-layout'
import { LocaleSwitcher } from '_/components/features/locale-switcher'
import { Logo } from '_/components/features/logo'
import { Container } from '_/components/ui/container'
import { ROUTES } from '_/constants/routes'
import { AnnouncementBanner } from '_/features/announcements/ui/containers/announcement-banner'
import { announcements } from '_/features/announcements/ui/containers/announcements-data'
import { LogoutButton } from '_/features/auth/ui/components/logout-button'
import { AuthGuard } from '_/features/auth/ui/guards/require-auth'
import { useAuth } from '_/features/auth/ui/hooks/use-auth'
import { NotificationBell } from '_/features/notifications/ui/components/notification-bell'
import { useIsCurrentPath } from '_/hooks/use-is-current-path'
import { useI18n } from '_/i18n/config-client'
import { tv } from '_/lib/third-party/tv'
import { LogOutIcon } from 'lucide-react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { type ComponentProps, useEffect, useRef, useState } from 'react'

const AccountDropdownMenu = ({ anchor }: { anchor: 'top start' | 'bottom end' }) => {
	const t = useI18n()
	const { signOut } = useAuth()
	const router = useRouter()

	const handleLogout = async () => {
		const result = await signOut()
		if (result.success) {
			router.push('/login')
		}
	}

	return (
		<DropdownMenu className='min-w-64' anchor={anchor}>
			<DropdownDivider />
			<DropdownItem onClick={handleLogout}>
				<LogOutIcon data-slot='icon' />
				<DropdownLabel>{t('sign_out')}</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	)
}

const SideBarLink = ({
	label,
	link,
	exact = false,
	className,
}: { label: string; link: string; exact?: boolean } & Omit<ComponentProps<typeof NextLink>, 'href'>) => {
	const isCurrentPath = useIsCurrentPath()

	return (
		<SidebarItem LinkComponent={NextLink} href={link} current={isCurrentPath(link, exact)}>
			<SidebarLabel className={className}>{label}</SidebarLabel>
		</SidebarItem>
	)
}


const SidebarBodyWrapper = () => {
	return (
		<SidebarBody>
			<SidebarSection>
			</SidebarSection>
			<SidebarSpacer />

			<SidebarSection>
			</SidebarSection>
			<SidebarSpacer />

			<SidebarSection>
				<LocaleSwitcher />
				<LogoutButton />
			</SidebarSection>
		</SidebarBody>
	)
}

const DesktopUser = () => {
	const { user } = useAuth()

	return (
		<span className='flex min-w-0 items-center gap-3'>
			<Avatar
				src={user?.avatar}
				initials={user?.name?.charAt(0) || 'U'}
				className='size-10'
				square
				alt={user?.name || 'User'}
			/>
			<span className='min-w-0'>
				<span className='text-primary-900 block truncate text-sm/5 font-medium'>{user?.name || 'User'}</span>
				<span className='text-primary-700 block truncate text-xs/5 font-normal'>
					{user?.email || 'user@example.com'}
				</span>
			</span>
		</span>
	)
}

const MobileUser = () => {
	const { user } = useAuth()

	return (
		<Dropdown>
			<DropdownButton as={NavbarItem}>
				<Avatar src={user?.avatar} initials={user?.name?.charAt(0) || 'U'} square alt={user?.name || 'User'} />
			</DropdownButton>
			<AccountDropdownMenu anchor='bottom end' />
		</Dropdown>
	)
}

// No horizontal padding: this element IS the content grid, whose gutter track
// already holds the page margin. Padding here sat outside those tracks and
// stacked with them, so a phone paid the margin twice and the content column
// was what gave way.
// min-h-dvh, minus the mobile navbar this sits under. A full viewport here made
// the section taller than the screen by exactly the navbar's height, so a child
// stuck to its bottom (a running total, an action bar) rested that far past the
// fold and could not be reached. The navbar is lg:hidden, so the inset only
// applies while it is on screen.
const mainContainerStyles = tv({
	base: [
		'min-h-[calc(100dvh-var(--thom-navbar-height,0px))]',
		'grid-flow-row-dense auto-rows-max grid-rows-[max-content_max-content_1fr]',
	],
})

const SidebarLayoutWithAuth = ({ children }: Partial<ComponentProps<typeof SidebarLayout>>) => {
	return (
		<SidebarLayout
			navbar={
				<Navbar>
					<NavbarSpacer />
					<NavbarSection>
						<NotificationBell />
						<MobileUser />
					</NavbarSection>
				</Navbar>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<div className='flex items-center gap-3 px-2 py-2'>
							<Logo className='h-8 w-auto' />
							{/* The navbar only shows below lg, so the sidebar carries the
							    bell on desktop. */}
							<div className='ml-auto max-lg:hidden'>
								<NotificationBell />
							</div>
						</div>
					</SidebarHeader>

					<SidebarBodyWrapper />

					<SidebarFooter className='max-lg:hidden'>
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<DesktopUser />
								{/* <ChevronUpIcon data-slot='icon' /> */}
							</DropdownButton>
							{/* <AccountDropdownMenu anchor='top start' /> */}
						</Dropdown>
					</SidebarFooter>
				</Sidebar>
			}
		>
			<AuthGuard>
				{announcements.map(announcement => (
					<AnnouncementBanner key={announcement.id} announcement={announcement} />
				))}
				<Container asChild>
					<section className={mainContainerStyles()}>{children}</section>
				</Container>
			</AuthGuard>
		</SidebarLayout>
	)
}

export { SidebarLayoutWithAuth }
