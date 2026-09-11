import type { FormContextValue } from '_/components/ui/form/form-types'
import { ROUTES } from '_/constants/routes'
import { createInitialLoginFormState, reduceLoginForm } from '_/features/auth/domain/reducers/login-form-reducer'
import { validateLoginForm } from '_/features/auth/domain/rules/auth-rules'
import { useAuth } from '_/features/auth/ui/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useReducer } from 'react'

export type LoginFormValues = {
	readonly email: string
	readonly password: string
}

export const useLoginForm = (): FormContextValue<LoginFormValues> => {
	const router = useRouter()
	const { signIn } = useAuth()
	const [formState, dispatch] = useReducer(reduceLoginForm, createInitialLoginFormState())

	const setField = useCallback((key: keyof LoginFormValues & string, value: string) => {
		dispatch(key === 'email' ? { type: 'EMAIL_CHANGED', email: value } : { type: 'PASSWORD_CHANGED', password: value })
	}, [])

	const cancel = useCallback(() => {
		router.back()
	}, [router])

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()

			// Validate form
			const errors = validateLoginForm(formState.email, formState.password)

			if (errors) {
				dispatch({ type: 'VALIDATION_FAILED', errors })
				return
			}

			// Submit
			dispatch({ type: 'SUBMIT_STARTED' })

			const result = await signIn({
				email: formState.email,
				password: formState.password,
			})

			if (result.success) {
				dispatch({ type: 'SUBMIT_SUCCEEDED' })
				router.push(ROUTES.pets.root)
			} else {
				dispatch({ type: 'SUBMIT_FAILED', error: result.error.message })
			}
		},
		[formState.email, formState.password, signIn, router],
	)

	return useMemo(
		() => ({
			state: {
				values: { email: formState.email, password: formState.password },
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
