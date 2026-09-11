import { type ComponentPropsWithoutRef, forwardRef } from 'react'

/**
 * Drop-in replacement for `next/image` in the Vite SPA.
 * Strips Next-only props and renders a plain <img>, forwarding the ref.
 */
type Props = ComponentPropsWithoutRef<'img'> & {
	fill?: boolean
	quality?: number
	priority?: boolean
	unoptimized?: boolean
	loader?: unknown
	placeholder?: string
	blurDataURL?: string
}

const NextImage = forwardRef<HTMLImageElement, Props>(
	(
		{
			fill: _fill,
			quality: _quality,
			priority: _priority,
			unoptimized: _unoptimized,
			loader: _loader,
			placeholder: _placeholder,
			blurDataURL: _blurDataURL,
			...props
		},
		ref,
	) => {
		return <img ref={ref} {...props} />
	},
)

NextImage.displayName = 'NextImage'

// oxlint-disable-next-line import/no-default-export -- matches next/image default export
export default NextImage
