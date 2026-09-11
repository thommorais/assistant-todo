import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '_/components/features/logo'
import { ROUTES } from '_/constants/routes'

const Home = () => {
	return (
		<main className='relative flex min-h-dvh w-full flex-col items-center justify-center'>
			<Link to={ROUTES.auth.login} aria-label='Login'>
				<Logo className='h-16 w-auto' />
			</Link>
		</main>
	)
}

export const Route = createFileRoute('/')({
	component: Home,
})
