import { useCallback, useRef } from 'react'

/** How long a press has to be held. Long enough not to fire on a tap, short
 * enough not to feel like the app is ignoring you. */
const HOLD_MS = 500

/** How far a pointer may drift before the press is treated as a scroll. Without
 * this the gesture fires on every flick down a long list. */
const SLOP_PX = 10

type LongPressHandlers = {
	readonly onPointerDown: (event: React.PointerEvent) => void
	readonly onPointerMove: (event: React.PointerEvent) => void
	readonly onPointerUp: () => void
	readonly onPointerCancel: () => void
	readonly onContextMenu: (event: React.SyntheticEvent) => void
}

/** Fires after a press is held in place.
 *
 * Returns handlers to spread onto the element. The native context menu is
 * suppressed on the same element: on iOS a long press opens the callout menu
 * and starts selecting text, which would land on top of whatever this opens.
 * Pair it with `select-none` so the text underneath cannot be dragged either.
 *
 * Disabled presses do nothing rather than firing late, which is what keeps a
 * held finger from acting on a row that has since started saving. */
export const useLongPress = (onLongPress: () => void, disabled = false): LongPressHandlers => {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const origin = useRef<{ x: number; y: number } | null>(null)

	const cancel = useCallback(() => {
		if (timer.current !== null) {
			clearTimeout(timer.current)
			timer.current = null
		}
		origin.current = null
	}, [])

	const onPointerDown = useCallback(
		(event: React.PointerEvent) => {
			if (disabled) {
				return
			}
			origin.current = { x: event.clientX, y: event.clientY }
			timer.current = setTimeout(() => {
				timer.current = null
				onLongPress()
			}, HOLD_MS)
		},
		[disabled, onLongPress],
	)

	const onPointerMove = useCallback(
		(event: React.PointerEvent) => {
			if (!origin.current) {
				return
			}
			const drifted =
				Math.abs(event.clientX - origin.current.x) > SLOP_PX ||
				Math.abs(event.clientY - origin.current.y) > SLOP_PX
			if (drifted) {
				cancel()
			}
		},
		[cancel],
	)

	const onContextMenu = useCallback((event: React.SyntheticEvent) => event.preventDefault(), [])

	return { onPointerDown, onPointerMove, onPointerUp: cancel, onPointerCancel: cancel, onContextMenu }
}
