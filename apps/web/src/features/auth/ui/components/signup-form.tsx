import { SignupForm } from '_/features/auth/ui/contexts/auth-form-context'
import { useI18n } from '_/i18n/config-client'
import { styles } from './auth-form-styles'

export const SignupFormView = () => {
	const t = useI18n()

	return (
		<SignupForm.Inline className={styles.form()}>
			<SignupForm.Text
				name='name'
				label='auth_field_name'
				placeholder='auth_field_name_placeholder'
				autoComplete='name'
				required
			/>

			<SignupForm.Text
				name='email'
				type='email'
				label='auth_field_email'
				placeholder='auth_field_email_placeholder'
				autoComplete='email'
				required
			/>

			<SignupForm.Text
				name='password'
				type='password'
				label='auth_field_password'
				placeholder='auth_field_password_create_placeholder'
				autoComplete='new-password'
				required
			/>

			<SignupForm.Text
				name='confirmPassword'
				type='password'
				label='auth_field_confirm_password'
				placeholder='auth_field_confirm_password_placeholder'
				autoComplete='new-password'
				required
			/>

			<SignupForm.SubmitError />

			<SignupForm.Submit fullWidth>{t('auth_sign_up')}</SignupForm.Submit>
		</SignupForm.Inline>
	)
}
