import type { ANY } from '_/types'
import type { Howl, HowlOptions } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useOnMount } from './use-on-mount'

type SpriteMap = {
	[key: string]: [number, number]
}

type HookOptions<T = ANY> = T & {
	volume?: number
	playbackRate?: number
	interrupt?: boolean
	soundEnabled?: boolean
	sprite?: SpriteMap
	onload?: () => void
}

type PlayOptions = {
	id?: number
	forceSoundEnabled?: boolean
	playbackRate?: number
}

type PlayFunction = (options?: PlayOptions) => void

type SoundControls = {
	sound: Howl | null
	stop: (id?: number) => void
	pause: (id?: number) => void
	duration: number | null
}

const useSound = <T = ANY>(
	src: string | string[],
	{
		volume = 1,
		playbackRate = 1,
		soundEnabled = true,
		interrupt = false,
		onload,
		...delegated
	}: HookOptions<T> = {} as HookOptions<T>,
): [PlayFunction, SoundControls] => {
	const HowlConstructor = useRef<typeof Howl | null>(null)
	const isMounted = useRef(false)
	const onloadRef = useRef(onload)
	onloadRef.current = onload

	const [duration, setDuration] = useState<number | null>(null)
	const [sound, setSound] = useState<Howl | null>(null)

	const handleLoad = useRef(function (this: Howl) {
		if (typeof onloadRef.current === 'function') {
			onloadRef.current.call(this)
		}
		if (isMounted.current) {
			setDuration(this.duration() * 1000)
		}
		setSound(this)
	})

	useOnMount(() => {
		isMounted.current = true

		import('howler').then(({ Howl }) => {
			if (!isMounted.current) return
			HowlConstructor.current = Howl
			new Howl({
				src: Array.isArray(src) ? src : [src],
				volume,
				rate: playbackRate,
				onload: handleLoad.current,
				...(delegated as Partial<HowlOptions>),
			})
		})

		return () => {
			isMounted.current = false
		}
	})

	const srcKey = Array.isArray(src) ? src.join(',') : src

	useEffect(() => {
		if (!HowlConstructor.current || !sound) return
		const Howl = HowlConstructor.current
		setSound(
			new Howl({
				src: Array.isArray(src) ? src : [src],
				volume,
				onload: handleLoad.current,
				...(delegated as Partial<HowlOptions>),
			}),
		)
	}, [srcKey])

	useEffect(() => {
		if (!sound) return
		sound.volume(volume)
		// HACK: When a sprite is defined, `sound.rate()` throws an error, because Howler tries to reset the "_default" sprite, which doesn't exist.
		if (!delegated.sprite) {
			sound.rate(playbackRate)
		}
	}, [sound, volume, playbackRate, delegated.sprite])

	const play: PlayFunction = useCallback(
		(options: PlayOptions = {}) => {
			if (!sound || (!soundEnabled && !options.forceSoundEnabled)) return
			if (interrupt) sound.stop()
			if (options.playbackRate) sound.rate(options.playbackRate)
			sound.play(options.id)
		},
		[sound, soundEnabled, interrupt],
	)

	const stop = useCallback(
		(id?: number) => {
			if (!sound) return
			sound.stop(id)
		},
		[sound],
	)

	const pause = useCallback(
		(id?: number) => {
			if (!sound) return
			sound.pause(id)
		},
		[sound],
	)

	return [play, { sound, stop, pause, duration }]
}

export { useSound }
