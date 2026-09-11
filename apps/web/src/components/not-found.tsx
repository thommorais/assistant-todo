import { Button } from '@thom/ui/button'
import { Link } from '@tanstack/react-router'
import { LOCAL_HREFS } from '_/constants'

// Root 404, the SPA equivalent of the former Next not-found.tsx.
const NotFound = () => {
	return (
		<main className='flex min-h-dvh flex-col justify-center px-12 lg:px-24'>
			<div className='mx-auto my-auto max-w-3xl py-12 text-center lg:py-24'>
				<p className='text-base font-semibold text-indigo-300'>404</p>
				<div className='mt-10 flex items-center justify-center gap-x-6'>
					<Button variant='outline' asChild>
						<Link to={LOCAL_HREFS.HOME}>
							<span>Back</span>
						</Link>
					</Button>
				</div>
			</div>
		</main>
	)
}

export { NotFound }
