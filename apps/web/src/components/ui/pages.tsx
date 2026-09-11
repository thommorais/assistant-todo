import { tv } from '_/lib/third-party/tv'
import { motion } from 'motion/react'
import type { ComponentProps } from 'react'

const pageStyles = tv({
	slots: {
		header: ['grid w-full pt-4 pb-6 md:pt-6 md:pb-8', `[grid-template-areas:"title_actions"_"sub-title_."]`],
		subtitle: 'text-info-700/70 [grid-area:sub-title]',
		title: 'text-primary-600 mb-2 text-3xl font-bold [grid-area:title]',
		emptyState: 'border-info-700/20 w-full place-self-start rounded-md border border-dashed py-12 text-center',
		emptyText: 'text-info-700/70',
		gridList: 'grid-rows-max grid grid-flow-row auto-rows-max grid-cols-1 gap-3 md:grid-cols-2 lg:gap-6 xl:grid-cols-3',
	},
})

const styles = pageStyles()

const PageHeader = ({ className, ...props }: ComponentProps<'header'>) => {
	return <header {...props} className={styles.header({ class: className })} />
}

const PageTitle = ({ children }: { readonly children: React.ReactNode }) => {
	return (
		<motion.h1
			initial={{ opacity: 0.25, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.2,
			}}
			exit={{
				opacity: 0.2,
			}}
			className={styles.title()}
		>
			{children}
		</motion.h1>
	)
}

const PageSubtitle = ({ className, ...props }: ComponentProps<'p'>) => (
	<p className={styles.subtitle({ class: className })} {...props} />
)

const EmptyState = (props: ComponentProps<typeof motion.div>) => {
	const variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
	}

	return (
		<motion.div
			variants={variants}
			initial='hidden'
			animate='visible'
			{...props}
			className={styles.emptyState({ class: props.className })}
		/>
	)
}

const ErrorState = ({ className, ...props }: ComponentProps<typeof EmptyState>) => {
	return (
		<EmptyState
			{...props}
			className={styles.emptyState({
				class: ['flex items-center justify-center border-danger-500 py-8', className],
			})}
		/>
	)
}

const EmptyText = ({ className, ...props }: ComponentProps<'p'>) => {
	return <p {...props} className={styles.emptyText({ class: className })} />
}

const GridList = (props: ComponentProps<typeof motion.div>) => {
	const variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.2,
				staggerChildren: 0.1,
				when: 'beforeChildren',
			},
		},
	}

	return (
		<motion.div
			variants={variants}
			initial='hidden'
			animate='visible'
			{...props}
			className={styles.gridList({ class: props.className })}
		/>
	)
}

export { EmptyState, EmptyText, ErrorState, GridList, PageHeader, PageSubtitle, PageTitle }
