import { createForm } from '_/components/ui/form/create-form'
import type { LoginFormValues } from '_/features/auth/ui/hooks/use-login-form'
import { useLoginForm } from '_/features/auth/ui/hooks/use-login-form'
import type { SignupFormValues } from '_/features/auth/ui/hooks/use-signup-form'
import { useSignupForm } from '_/features/auth/ui/hooks/use-signup-form'
import type { ReactNode } from 'react'

export const LoginForm = createForm<LoginFormValues>()
export const SignupForm = createForm<SignupFormValues>()

export const LoginFormProvider = ({ children }: { readonly children: ReactNode }) => {
	const form = useLoginForm()

	return <LoginForm.Provider {...form}>{children}</LoginForm.Provider>
}

export const SignupFormProvider = ({ children }: { readonly children: ReactNode }) => {
	const form = useSignupForm()

	return <SignupForm.Provider {...form}>{children}</SignupForm.Provider>
}
