import { SignupFormView } from '_/features/auth/ui/components/signup-form'
import { SignupFormProvider } from '_/features/auth/ui/contexts/auth-form-context'

export const SignupPage = () => (
	<SignupFormProvider>
		<SignupFormView />
	</SignupFormProvider>
)
