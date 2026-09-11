import { Toaster } from '@thom/ui/toast'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarLayoutWithAuth } from '_/components/features/sidebar-layout'
import { NotificationsProvider } from '_/features/notifications/ui/contexts/notifications-context'
import { NotificationsRepositoriesProvider } from '_/features/notifications/ui/contexts/notifications-repositories-provider'

// The provider wraps the layout rather than a single app: the bell lives in the
// chrome every signed-in screen shares, so notifications are the one feature
// whose boundary is the whole authenticated area.
const AuthenticatedLayout = () => {
	return (
		<NotificationsRepositoriesProvider>
			<NotificationsProvider>
				<SidebarLayoutWithAuth>
					<Outlet />
				</SidebarLayoutWithAuth>
				<Toaster
					toastOptions={{
						className: 'rounded-md',
						unstyled: true,
					}}
				/>
			</NotificationsProvider>
		</NotificationsRepositoriesProvider>
	)
}

export const Route = createFileRoute('/_authenticated')({
	component: AuthenticatedLayout,
})
