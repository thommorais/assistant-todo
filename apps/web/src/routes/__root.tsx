import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RouteErrorComponent } from '_/components/error-boundary'
import { NotFound } from '_/components/not-found'
import { LocaleProviders } from '_/components/providers/locale-providers'
import { DocumentTitle } from '_/components/features/document-title'
import { TitleBar } from '_/components/features/titlebar'
import { AuthProvider } from '_/features/auth/ui/contexts/auth-provider'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

const RootComponent = () => {
	return (
		// NuqsAdapter binds useQueryState to this router, so query-string state
		// (e.g. the clinical record tab) reads and writes through TanStack rather
		// than touching window.location directly.
		<NuqsAdapter>
			<LocaleProviders>
				<AuthProvider>
					<DocumentTitle />
					<TitleBar />
					<Outlet />
				</AuthProvider>
			</LocaleProviders>
		</NuqsAdapter>
	)
}

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: RouteErrorComponent,
	notFoundComponent: NotFound,
})
