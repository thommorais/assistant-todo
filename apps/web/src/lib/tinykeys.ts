export type KeyBindingPress = [mods: string[], key: string | RegExp]

export interface KeyBindingMap {
	[keybinding: string]: (event: KeyboardEvent) => void
}

export interface KeyBindingHandlerOptions {
	timeout?: number
}

export interface KeyBindingOptions extends KeyBindingHandlerOptions {
	event?: 'keydown' | 'keyup'
	capture?: boolean
}

const KEYBINDING_MODIFIER_KEYS = ['Shift', 'Meta', 'Alt', 'Control']

const DEFAULT_TIMEOUT = 1000

const DEFAULT_EVENT = 'keydown' as const

const PLATFORM = typeof navigator === 'object' ? navigator.platform : ''
const APPLE_DEVICE = /Mac|iPod|iPhone|iPad/.test(PLATFORM)

const MOD = APPLE_DEVICE ? 'Meta' : 'Control'

const ALT_GRAPH_ALIASES = PLATFORM === 'Win32' ? ['Control', 'Alt'] : APPLE_DEVICE ? ['Alt'] : []

const getModifierState = (event: KeyboardEvent, mod: string) => {
	return typeof event.getModifierState === 'function'
		? event.getModifierState(mod) || (ALT_GRAPH_ALIASES.includes(mod) && event.getModifierState('AltGraph'))
		: false
}

const parseKeybinding = (str: string): KeyBindingPress[] => {
	return str
		.trim()
		.split(' ')
		.map(press => {
			let mods = press.split(/\b\+/)
			let key: string | RegExp = mods.pop() as string
			const match = key.match(/^\((.+)\)$/)
			if (match) {
				key = new RegExp(`^${match[1]}$`)
			}
			mods = mods.map(mod => (mod === '$mod' ? MOD : mod))
			return [mods, key]
		})
}

const matchKeyBindingPress = (event: KeyboardEvent, [mods, key]: KeyBindingPress): boolean => {
	// prettier-ignore
	return !(
		// Allow either the `event.key` or the `event.code`
		// MDN event.key: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
		// MDN event.code: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
		(
			(key instanceof RegExp
				? !(key.test(event.key) || key.test(event.code))
				: key.toUpperCase() !== event.key.toUpperCase() && key !== event.code) ||
			// Ensure all the modifiers in the keybinding are pressed.
			mods.find(mod => {
				return !getModifierState(event, mod)
			}) ||
			// KEYBINDING_MODIFIER_KEYS (Shift/Control/etc) change the meaning of a
			// keybinding. So if they are pressed but aren't part of the current
			// keybinding press, then we don't have a match.
			KEYBINDING_MODIFIER_KEYS.find(mod => {
				return !mods.includes(mod) && key !== mod && getModifierState(event, mod)
			})
		)
	)
}

const createKeybindingsHandler = (
	keyBindingMap: KeyBindingMap,
	options: KeyBindingHandlerOptions = {},
): EventListener => {
	const timeout = options.timeout ?? DEFAULT_TIMEOUT

	const keyBindings = Object.keys(keyBindingMap).map(key => {
		return [parseKeybinding(key), keyBindingMap[key]] as const
	})

	const possibleMatches = new Map<KeyBindingPress[], KeyBindingPress[]>()
	let timer: ReturnType<typeof setTimeout> | null = null

	return event => {
		if (!(event instanceof KeyboardEvent)) {
			return
		}

		for (const keyBinding of keyBindings) {
			const sequence = keyBinding[0]
			const callback = keyBinding[1]

			const prev = possibleMatches.get(sequence)
			const remainingExpectedPresses = prev ? prev : sequence
			const currentExpectedPress = remainingExpectedPresses[0]

			if (!currentExpectedPress) {
				continue
			}

			const matches = matchKeyBindingPress(event, currentExpectedPress)

			if (!matches) {
				if (!getModifierState(event, event.key)) {
					possibleMatches.delete(sequence)
				}
			} else if (remainingExpectedPresses.length > 1) {
				possibleMatches.set(sequence, remainingExpectedPresses.slice(1))
			} else {
				possibleMatches.delete(sequence)
				callback?.(event)
			}
		}

		if (timer) {
			clearTimeout(timer)
		}

		timer = setTimeout(possibleMatches.clear.bind(possibleMatches), timeout)
	}
}

const tinykeys = (
	target: Window | HTMLElement,
	keyBindingMap: KeyBindingMap,
	{ event = DEFAULT_EVENT, capture, timeout }: KeyBindingOptions = {},
): (() => void) => {
	const onKeyEvent = createKeybindingsHandler(keyBindingMap, { timeout })
	target.addEventListener(event, onKeyEvent, capture)
	return () => {
		target.removeEventListener(event, onKeyEvent, capture)
	}
}

export { tinykeys }
