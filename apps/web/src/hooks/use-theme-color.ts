import { useEffect } from 'react'

/**
 * Swaps the page's `<meta name="theme-color">` AND the actual `html`/`body`
 * background color to `color` for as long as the calling component is
 * mounted, restoring whatever was there before on unmount.
 *
 * The meta tag alone does nothing in a regular (non-home-screen-installed)
 * iOS Safari tab: `theme-color` only styles chrome for standalone/PWA
 * installs. In an ordinary tab, Safari colors its address bar and bottom
 * toolbar by sampling the page's own rendered background — visible during
 * elastic overscroll and in the safe-area insets above/below the viewport —
 * so `html`/`body` need a real background-color, not just the meta tag, for
 * the chrome to actually match a dark-themed route like a game.
 */
export const useThemeColor = (color: string): void => {
	useEffect(() => {
		const meta = document.querySelector('meta[name="theme-color"]')
		const previousMeta = meta?.getAttribute('content') ?? null
		meta?.setAttribute('content', color)

		const html = document.documentElement
		const { body } = document
		const previousHtmlBg = html.style.backgroundColor
		const previousBodyBg = body.style.backgroundColor
		html.style.backgroundColor = color
		body.style.backgroundColor = color

		return () => {
			if (previousMeta !== null) {
				meta?.setAttribute('content', previousMeta)
			}
			html.style.backgroundColor = previousHtmlBg
			body.style.backgroundColor = previousBodyBg
		}
	}, [color])
}
