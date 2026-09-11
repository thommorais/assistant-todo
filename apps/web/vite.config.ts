import { resolve } from 'node:path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { intlayer } from 'vite-intlayer'
import { comlink } from 'vite-plugin-comlink'

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
	// host exposes the dev server on the LAN so a phone can reach it; basicSsl
	// below serves it over HTTPS. The camera needs a secure context, and iOS
	// Safari has no "treat this LAN address as secure" escape hatch the way
	// Chrome does, so without both the scanner cannot be tested on a phone at
	// all. The certificate is self-signed and accepted once per device.
	server: {
		host: true,
	},
	build: {
		sourcemap: true,
		rolldownOptions: {
			output: {
				// Split the stable framework core into its own chunk so it stays
				// cached across app deploys (route/feature chunks are already
				// code-split on demand by the TanStack Router plugin above).
				advancedChunks: {
					groups: [
						{
							name: 'react-vendor',
							test: /[\\/]node_modules[\\/](react|react-dom|scheduler|@tanstack[\\/]react-router)[\\/]/,
						},
					],
				},
			},
		},
	},
	plugins: [
		tanstackRouter({
			routesDirectory: './src/routes',
			generatedRouteTree: './src/routeTree.gen.ts',
			autoCodeSplitting: true,
			target: 'react',
		}),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		tailwindcss(),
		intlayer(),
		comlink(),
	],
	worker: {
		plugins: () => [comlink()],
	},
	resolve: {
		alias: {
			_: resolve(import.meta.dirname, './src'),
			'next/image': resolve(import.meta.dirname, './src/libs/next-image-shim.tsx'),
			'next/link': resolve(import.meta.dirname, './src/libs/next-link-shim.tsx'),
			'next/navigation': resolve(import.meta.dirname, './src/libs/next-navigation-shim.ts'),
		},
	},
})
