import { isServerSide } from '_/lib/is-server-side'
import { z } from 'zod'

export const EMPTY = 'EMPTY' as const

// Vite exposes env through `import.meta.env` (not `process.env`). `MODE` is
// 'development' | 'production' | 'test'; `VITE_*` vars are the public surface.
const viteEnv = import.meta.env

const baseFlags = {
	IS_PROD: viteEnv.PROD,
	IS_DEV: viteEnv.DEV,
	IS_TEST: viteEnv.MODE === 'test',
} as const

const flags = isServerSide()
	? ({
			...baseFlags,
			IS_CLIENT: false,
			IS_SERVER: true,
		} as const)
	: ({
			...baseFlags,
			IS_CLIENT: true,
			IS_SERVER: false,
		} as const)

type EnvsFromFlags<TFlags> = TFlags extends { IS_CLIENT: true } ? TFlags & ClientEnvs : TFlags & ServerEnvs

type Envs = EnvsFromFlags<typeof flags>

const createEnvs = (parsed: MergedSafeParseReturn): Envs => {
	if (parsed.success === false) {
		const message = 'Invalid environment variables'
		throw new Error(message)
	}

	const extendedEnvs = {
		...parsed.data,
		...flags,
	} as Envs

	const ENVS = new Proxy(extendedEnvs, {
		get(target, prop) {
			if (typeof prop !== 'string') {
				return undefined
			}

			if (prop in flags) {
				return Reflect.get(target, prop)
			}

			if (!isServerSide() && !prop.startsWith('PUBLIC_')) {
				const errorMessage = 'Not allowed to access server-side environment variables on the client'
				throw new Error(import.meta.env.PROD ? errorMessage : `${errorMessage} - '${prop}'`)
			}
			return Reflect.get(target, prop)
		},
	})

	return ENVS
}

const clientSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),
	PUBLIC_WEBAPP_URL: z.url().default('https://localhost:3000'),
	PUBLIC_SITE_NAME: z.string().default('thom'),
	// Optional: only consumed by the (currently disabled) push-notification SW.
	PUBLIC_VAPID_PUBLIC_KEY: z.string().default(''),
	// Empty string means "same origin": base serves the SPA, so the PocketBase
	// client resolves against the current host. The localhost default is for
	// local dev, where the SPA (Vite) and PocketBase run on separate ports.
	// Normalized to "/" since the PocketBase SDK resolves "" against the
	// current pathname instead of the origin root.
	PUBLIC_API_URL: z
		.union([z.url(), z.literal('')])
		.default('http://127.0.0.1:8090')
		.transform(value => (value === '' ? '/' : value)),
})

// Client-side env vars are also available on the server
const serverSchema = z.object({
	VAPID_PRIVATE_KEY: z.string(),
	API_URL: z.union([z.url(), z.literal('')]).default('http://127.0.0.1:8090'),
	...clientSchema.shape,
})

// Don't touch
// --------------------------

type ServerEnvs = z.infer<typeof serverSchema>
type ClientEnvs = z.infer<typeof clientSchema>
type EnvsKeys = keyof ServerEnvs

type PROCESS_ENV = Record<EnvsKeys, string | undefined>

type MergedSafeParseReturn = z.ZodSafeParseResult<ServerEnvs | ClientEnvs>

const parseEnvs = (
	processEnv: PROCESS_ENV,
	clientSchema: z.ZodSchema<ClientEnvs>,
	serverSchema: z.ZodSchema<ServerEnvs>,
): MergedSafeParseReturn => {
	const schema = isServerSide() ? serverSchema : clientSchema
	return schema.safeParse(processEnv)
}

const processEnv: PROCESS_ENV = {
	// Server-side env vars (unused in the SPA; kept for schema parity)
	NODE_ENV: viteEnv.MODE as 'development' | 'test' | 'production',
	VAPID_PRIVATE_KEY: viteEnv.VITE_VAPID_PRIVATE_KEY,
	API_URL: viteEnv.VITE_API_URL,

	// Client-side env vars (sourced from Vite's VITE_* public surface)
	PUBLIC_SITE_NAME: viteEnv.VITE_SITE_NAME,
	PUBLIC_WEBAPP_URL: viteEnv.VITE_WEBAPP_URL,
	PUBLIC_VAPID_PUBLIC_KEY: viteEnv.VITE_VAPID_PUBLIC_KEY,
	PUBLIC_API_URL: viteEnv.VITE_API_URL,
}

const ENVS = createEnvs(parseEnvs(processEnv, clientSchema, serverSchema))

export { ENVS }
