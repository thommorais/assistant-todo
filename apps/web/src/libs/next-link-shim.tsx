import { Link as RouterLink } from '@tanstack/react-router'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

/**
 * Drop-in replacement for `next/link` in the Vite SPA.
 *
 * Maps the Next `href` (always a string path in this codebase) onto TanStack
 * Router's `to`. Next-only props are accepted and ignored.
 */
type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
	href: string
	children?: ReactNode
	prefetch?: boolean
	replace?: boolean
	scroll?: boolean
	shallow?: boolean
	passHref?: boolean
	legacyBehavior?: boolean
}

const NextLink = ({
	href,
	prefetch: _prefetch,
	replace,
	scroll: _scroll,
	shallow: _shallow,
	passHref: _passHref,
	legacyBehavior: _legacyBehavior,
	children,
	...rest
}: NextLinkProps) => {
	return (
		// TanStack's typed router rejects arbitrary string paths; this codebase
		// builds hrefs from the shared ROUTES map, so cast through.
		<RouterLink to={href as never} replace={replace} {...rest}>
			{children}
		</RouterLink>
	)
}

// oxlint-disable-next-line import/no-default-export -- matches next/link default export
export default NextLink
