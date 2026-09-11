import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routeTree } from '../routeTree.gen'

function renderAt(path: string) {
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [path] }),
	})
	return render(<RouterProvider router={router} />)
}

describe('routes', () => {
	it('renders the index route', async () => {
		renderAt('/')
		expect(await screen.findByRole('heading', { name: /get started/i })).toBeTruthy()
	})

	it('renders the about route', async () => {
		renderAt('/about')
		expect(await screen.findByRole('heading', { name: /about/i })).toBeTruthy()
	})

	it('renders the not-found component for an unknown path', async () => {
		renderAt('/nope')
		expect(await screen.findByRole('heading', { name: /^not found$/i })).toBeTruthy()
	})
})
