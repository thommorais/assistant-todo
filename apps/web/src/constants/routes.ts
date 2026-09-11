/**
 * Application route constants
 * Centralized route definitions to avoid hardcoding paths throughout the application
 */

export const ROUTES = {
	// Root
	home: '/',

	// Authentication
	auth: {
		login: '/login',
		welcome: '/welcome',
		recovery: '/recovery',
	},
} as const
