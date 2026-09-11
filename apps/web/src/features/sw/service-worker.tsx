import { useIsomorphicEffect } from '_/hooks/use-isomorphic-effect'
import { logger } from '_/lib/logger'

const swConfig: RegistrationOptions = { scope: '/', updateViaCache: 'none' }

const registerServiceWorker = async () => {
	try {
		return await navigator.serviceWorker.register('/sw.js', swConfig)
	} catch (error) {
		logger.error('Failed to register service worker', error)
		return null
	}
}

// Push opt-in lives with the rest of the feature, in
// features/notifications/ui/hooks/use-push-subscription, next to the inbox it
// feeds. This only has to get the worker registered; everything else waits on
// navigator.serviceWorker.ready.
const ServiceWorkerRegistrar = () => {
	useIsomorphicEffect(() => {
		if ('serviceWorker' in navigator) {
			registerServiceWorker()
		}
	}, [])

	return null
}

export { ServiceWorkerRegistrar }
