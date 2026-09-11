import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

const RootComponent = () => {
	return (
		<NuqsAdapter>
			<Outlet />
		</NuqsAdapter>
	)
}

export const Route = createRootRoute({
	component: RootComponent,
})
