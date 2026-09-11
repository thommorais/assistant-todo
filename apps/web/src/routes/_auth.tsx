import { Card } from '@thom/ui/card'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Logo } from '_/components/features/logo'
import { Container } from '_/components/ui/container'
import { AuthGuard } from '_/features/auth/ui/guards/redirect-if-authed'

const AuthLayout = () => {
	return (
		<Container asChild className='container mx-auto min-h-dvh grid-rows-1 place-items-center'>
			<main className='mx-auto w-full max-w-sm px-1 sm:max-w-lg'>
				<AuthGuard>
					<Card className='w-full space-y-12 py-8'>
						<Logo className='row-start-1 mx-auto h-16 w-auto' />
						<Outlet />
					</Card>
				</AuthGuard>
			</main>
		</Container>
	)
}

export const Route = createFileRoute('/_auth')({
	component: AuthLayout,
})
