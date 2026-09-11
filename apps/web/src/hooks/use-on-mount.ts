import { type EffectCallback, useEffect } from 'react'

const useOnMount = (callback: EffectCallback) => {
	// oxlint-disable-next-line react-hooks/exhaustive-deps -- is just for mounting so we don't want to add the callback as a dependency
	useEffect(callback, [])
}

export { useOnMount }
