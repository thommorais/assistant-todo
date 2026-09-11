import { createFileRoute } from '@tanstack/react-router'

const Home = () => {
	return <main className='relative flex min-h-dvh w-full flex-col items-center justify-center'>hey</main>
}

export const Route = createFileRoute('/')({
	component: Home,
})
