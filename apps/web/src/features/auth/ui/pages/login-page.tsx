import { LoginFormView } from '_/features/auth/ui/components/login-form'
import { LoginFormProvider } from '_/features/auth/ui/contexts/auth-form-context'

export const LoginPage = () => (
	<LoginFormProvider>
		<LoginFormView />
	</LoginFormProvider>
)
