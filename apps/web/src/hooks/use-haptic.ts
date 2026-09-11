import { logger } from '_/lib/logger'
import { useCallback, useEffect, useRef } from 'react'

type Duration = number | number[]

const supportsVibrate = (): boolean => {
	if (typeof navigator === 'undefined') return false
	return 'vibrate' in navigator
}

const supportsIOSSwitch = (): boolean => {
	if (typeof document === 'undefined') return false
	try {
		const input = document.createElement('input')
		input.setAttribute('switch', '')
		return input.getAttribute('switch') !== null
	} catch {
		return false
	}
}

export const supportsHaptics: boolean = typeof window !== 'undefined' && (supportsVibrate() || supportsIOSSwitch())

const triggerIOSHaptic = (): void => {
	try {
		const id = `_h${Math.random().toString(36).slice(2)}`
		const input = document.createElement('input')
		input.type = 'checkbox'
		input.id = id
		input.setAttribute('switch', '')
		input.style.position = 'absolute'
		input.style.opacity = '0'
		input.style.pointerEvents = 'none'
		document.body.appendChild(input)

		const label = document.createElement('label')
		label.htmlFor = id
		label.style.position = 'absolute'
		label.style.opacity = '0'
		label.style.pointerEvents = 'none'
		document.body.appendChild(label)

		label.click()

		document.body.removeChild(label)
		document.body.removeChild(input)
	} catch (error) {
		logger.error('Error triggering iOS haptic:', error)
	}
}

const dispatchHaptic = (duration: Duration = 50): void => {
	if (supportsVibrate()) {
		navigator.vibrate(duration)
	} else {
		if (Array.isArray(duration)) {
			for (const d of duration) {
				setTimeout(triggerIOSHaptic, Math.max(d, 101))
			}
			return
		}
		triggerIOSHaptic()
	}
}

const useHaptic = (): ((duration?: Duration) => void) => {
	const triggerHaptic = useCallback((duration?: Duration) => {
		dispatchHaptic(duration)
	}, [])
	return triggerHaptic
}

const useHapticsError = () => {
	const triggerHaptic = useHaptic()
	const timerIds = useRef<ReturnType<typeof setTimeout>[]>([])

	useEffect(() => {
		return () => {
			for (const id of timerIds.current) clearTimeout(id)
			timerIds.current = []
		}
	}, [])

	const triggerErrorHaptic = useCallback(() => {
		try {
			if (supportsVibrate()) {
				triggerHaptic([40, 60, 40, 60, 40, 60, 40])
			} else {
				triggerHaptic()
				timerIds.current.push(setTimeout(() => triggerHaptic(), 100))
				timerIds.current.push(setTimeout(() => triggerHaptic(), 200))
				timerIds.current.push(setTimeout(() => triggerHaptic(), 300))
			}
		} catch (error) {
			logger.error('Error triggering error haptic:', error)
		}
	}, [triggerHaptic])

	return triggerErrorHaptic
}

const useHapticsConfirm = () => {
	const triggerHaptic = useHaptic()

	const triggerConfirmHaptic = useCallback(() => {
		try {
			triggerHaptic([100])
		} catch (error) {
			logger.error('Error triggering confirm haptic:', error)
		}
	}, [triggerHaptic])

	return triggerConfirmHaptic
}

export { useHaptic, useHapticsConfirm, useHapticsError }
