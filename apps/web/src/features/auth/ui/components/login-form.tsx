import { LoginForm } from '_/features/auth/ui/contexts/auth-form-context'
import { useI18n } from '_/i18n/config-client'
import { styles } from './auth-form-styles'

export const LoginFormView = () => {
	const t = useI18n()

	return (
		<LoginForm.Inline className={styles.form()}>
			<LoginForm.Text
				name='email'
				type='email'
				label='auth_field_email'
				placeholder='auth_field_email_placeholder'
				autoComplete='email'
				required
			/>

			<LoginForm.Text
				name='password'
				type='password'
				label='auth_field_password'
				placeholder='auth_field_password_placeholder'
				autoComplete='current-password'
				required
			/>

			<LoginForm.SubmitError />

			<LoginForm.Submit fullWidth>{t('auth_sign_in')}</LoginForm.Submit>
		</LoginForm.Inline>
	)
}
