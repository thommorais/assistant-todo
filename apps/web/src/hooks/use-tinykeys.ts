import type { KeyBindingMap, KeyBindingOptions } from '_/lib/tinykeys'
import { tinykeys } from '_/lib/tinykeys'
import { useEffect } from 'react'

const useTinykeys = (
	keyBindingMap: KeyBindingMap,
	target: Window | HTMLElement = window,
	options: KeyBindingOptions = {},
) => {
	useEffect(() => {
		const unsub = tinykeys(target, keyBindingMap, options)

		return () => unsub()
	}, [keyBindingMap, target, options])

	return
}

export { useTinykeys }
