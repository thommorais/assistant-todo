import { Button } from '@thom/ui/button'
import { Card, CardFooter, CardHeader } from '@thom/ui/card'
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { Container } from '_/components/ui/container'
import { Component, Fragment, type ReactNode, useCallback } from 'react'

type ErrorFallbackProps = {
	readonly retry?: () => void
}

const ErrorFallback = ({ retry }: ErrorFallbackProps) => {
	const router = useRouter()

	const onClick = useCallback(() => {
		if (retry) {
			retry()
			return
		}
		router.invalidate()
	}, [retry, router])

	return (
		<Container asChild>
			<section className='h-dvh place-items-center'>
				<Card className='w-full max-w-sm'>
					<CardHeader className='w-full'>
						<h2 className='text-danger-700 w-full grow text-center'>Something went wrong!</h2>
					</CardHeader>
					<CardFooter className='justify-center'>
						<Button type='button' variant='outline' color='info' onClick={onClick}>
							Try again
						</Button>
					</CardFooter>
				</Card>
			</section>
		</Container>
	)
}

type ErrorBoundaryProps = {
	readonly children: ReactNode
}

type ErrorBoundaryState = {
	readonly hasError: boolean
	readonly key: number
}

/** Catches render errors in its subtree and offers a retry that remounts the children. */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false, key: 0 }

	static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
		return { hasError: true }
	}

	handleRetry = () => {
		this.setState(s => ({ hasError: false, key: s.key + 1 }))
	}

	render() {
		if (this.state.hasError) {
			return <ErrorFallback retry={this.handleRetry} />
		}
		return <Fragment key={this.state.key}>{this.props.children}</Fragment>
	}
}

/** Route-level `errorComponent`: TanStack Router renders this with the caught error and a reset fn. */
const RouteErrorComponent = ({ reset }: ErrorComponentProps) => {
	return <ErrorFallback retry={reset} />
}

export { ErrorBoundary, RouteErrorComponent }
