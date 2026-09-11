import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
	component: About,
})

function About() {
	return (
		<section id='center'>
			<h1>About</h1>
			<p>File-based routing with TanStack Router.</p>
		</section>
	)
}
