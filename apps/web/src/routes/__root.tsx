import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
	component: RootLayout,
	notFoundComponent: NotFound,
})

function RootLayout() {
	return (
		<>
			<nav className='site-nav'>
				<Link to='/' activeProps={{ className: 'active' }}>
					Home
				</Link>
				<Link to='/about' activeProps={{ className: 'active' }}>
					About
				</Link>
			</nav>
			<Outlet />
		</>
	)
}

function NotFound() {
	return (
		<section id='center'>
			<h1>Not found</h1>
			<Link to='/'>Go home</Link>
		</section>
	)
}
