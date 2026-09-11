import type { FormContextValue } from '_/components/ui/form/form-types'
import { ROUTES } from '_/constants/routes'
import { createInitialSignupFormState, reduceSignupForm } from '_/features/auth/domain/reducers/signup-form-reducer'
import { validateSignupForm } from '_/features/auth/domain/rules/auth-rules'
import { useAuth } from '_/features/auth/ui/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useReducer } from 'react'

export type SignupFormValues = {
	readonly name: string
	readonly email: string
	readonly password: string
	readonly confirmPassword: string
}

export const useSignupForm = (): FormContextValue<SignupFormValues> => {
	const router = useRouter()
	const { signUp } = useAuth()
	const [formState, dispatch] = useReducer(reduceSignupForm, createInitialSignupFormState())

	const setField = useCallback((key: keyof SignupFormValues & string, value: string) => {
		if (key === 'name') {
			dispatch({ type: 'NAME_CHANGED', name: value })
			return
		}
		if (key === 'email') {
			dispatch({ type: 'EMAIL_CHANGED', email: value })
			return
		}
		if (key === 'password') {
			dispatch({ type: 'PASSWORD_CHANGED', password: value })
			return
		}
		dispatch({ type: 'CONFIRM_PASSWORD_CHANGED', confirmPassword: value })
	}, [])

	const cancel = useCallback(() => {
		router.back()
	}, [router])

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()

			// Validate form
			const errors = validateSignupForm(formState.email, formState.password, formState.confirmPassword, formState.name)

			if (errors) {
				dispatch({ type: 'VALIDATION_FAILED', errors })
				return
			}

			// Submit
			dispatch({ type: 'SUBMIT_STARTED' })

			const result = await signUp({
				email: formState.email,
				password: formState.password,
				name: formState.name,
			})

			if (result.success) {
				dispatch({ type: 'SUBMIT_SUCCEEDED' })
				router.push(ROUTES.pets.root)
			} else {
				dispatch({ type: 'SUBMIT_FAILED', error: result.error.message })
			}
		},
		[formState.email, formState.password, formState.confirmPassword, formState.name, signUp, router],
	)

	return useMemo(
		() => ({
			state: {
				values: {
					name: formState.name,
					email: formState.email,
					password: formState.password,
					confirmPassword: formState.confirmPassword,
				},
				errors: formState.errors,
				isSubmitting: formState.isSubmitting,
				submitError: formState.submitError,
			},
			actions: { setField, submit: handleSubmit, cancel },
			meta: { mode: 'create' },
		}),
		[formState, setField, handleSubmit, cancel],
	)
}
