import { type RefObject, useCallback, useRef } from 'react'

/**
 * Makes a scroll container scroll by driving its `scrollTop` from its own
 * non-passive wheel and touch listeners.
 *
 * A list inside a popover that portals to `document.body` cannot be scrolled
 * while a modal dialog is open. The dialog's scroll lock (react-remove-scroll,
 * under both Headless UI and Radix) registers a bubble-phase `wheel` and
 * `touchmove` listener on `document` and preventDefault()s every event whose
 * target sits outside the dialog's own subtree — which is exactly where a
 * portalled list sits. React's `onWheel`/`onTouchMove` are passive and run
 * before the event has bubbled that far, so they cannot see it coming or undo
 * it. Listening on the element itself and moving `scrollTop` by hand does, and
 * behaves the same when no lock is active, so it is applied unconditionally.
 *
 * Returns the ref to put on the container and a ref object holding the node,
 * for callers that also need to query inside it.
 */
export const useManualScroll = <T extends HTMLElement>(): readonly [
	(element: T | null) => (() => void) | undefined,
	RefObject<T | null>,
] => {
	const node = useRef<T | null>(null)

	const attach = useCallback((element: T | null) => {
		node.current = element
		if (!element) {
			return
		}

		const onWheel = (event: WheelEvent) => {
			event.preventDefault()
			// deltaMode is 0 in pixels, 1 in lines, 2 in pages.
			const multiplier = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? element.clientHeight : 1
			element.scrollTop += event.deltaY * multiplier
		}

		let start: { y: number; scrollTop: number } | null = null
		const onTouchStart = (event: TouchEvent) => {
			const touch = event.touches[0]
			start = touch ? { y: touch.clientY, scrollTop: element.scrollTop } : null
		}
		const onTouchMove = (event: TouchEvent) => {
			const touch = event.touches[0]
			if (!start || !touch) {
				return
			}
			event.preventDefault()
			element.scrollTop = start.scrollTop + (start.y - touch.clientY)
		}

		element.addEventListener('wheel', onWheel, { passive: false })
		element.addEventListener('touchstart', onTouchStart, { passive: true })
		element.addEventListener('touchmove', onTouchMove, { passive: false })

		// Returned from a ref callback, so the listeners are bound the moment the
		// container mounts. An effect would miss it: the container lives in a
		// portal that only exists while the popover is open.
		return () => {
			element.removeEventListener('wheel', onWheel)
			element.removeEventListener('touchstart', onTouchStart)
			element.removeEventListener('touchmove', onTouchMove)
			node.current = null
		}
	}, [])

	return [attach, node] as const
}
