import { Button } from '@thom/ui/button'
import { useHaptic } from '_/hooks/use-haptic'
import type { EventFor } from '_/types/utils'

type HapticButtonProps = React.ComponentProps<typeof Button>

const HapticButton = ({ onClick, children, ...props }: HapticButtonProps) => {
	const triggerHaptic = useHaptic()

	const handleClick: React.MouseEventHandler = event => {
		triggerHaptic()
		onClick?.(event as EventFor<'button', 'onClick'>)
	}

	return (
		<Button {...props} onClick={handleClick}>
			{children}
		</Button>
	)
}

export { HapticButton }
