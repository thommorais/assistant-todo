import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './app'

describe('App', () => {
	it('renders the heading', () => {
		render(<App />)
		expect(screen.getByRole('heading', { name: /get started/i })).toBeTruthy()
	})

	it('increments the counter on click', async () => {
		const { default: userEvent } = await import('@testing-library/user-event')
		render(<App />)
		const button = screen.getByRole('button', { name: /count is 0/i })
		await userEvent.click(button)
		expect(screen.getByRole('button', { name: /count is 1/i })).toBeTruthy()
	})
})
