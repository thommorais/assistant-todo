import { MIN_PASSWORD_LENGTH } from '_/features/auth/domain/constants'
import type {
	ConfirmPasswordErrorKey,
	EmailErrorKey,
	LoginFormErrors,
	NameErrorKey,
	PasswordErrorKey,
	SignupFormErrors,
} from '_/features/auth/domain/types'

/**
 * Validates email format using simple regex
 * @pure
 */
export const isValidEmail = (value: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(value)
}

/**
 * Validates password meets minimum requirements
 * @pure
 */
export const isValidPassword = (value: string): boolean => {
	return value.length >= MIN_PASSWORD_LENGTH
}

/**
 * Validates email field
 * Returns error key or undefined if valid
 * @pure
 */
export const validateEmail = (email: string): EmailErrorKey | undefined => {
	const trimmed = email.trim()

	if (!trimmed) {
		return 'auth_validation_email_required'
	}

	if (!isValidEmail(trimmed)) {
		return 'auth_validation_email_invalid'
	}

	return undefined
}

/**
 * Validates password field
 * Returns error key or undefined if valid
 * @pure
 */
export const validatePassword = (password: string): PasswordErrorKey | undefined => {
	if (!password) {
		return 'auth_validation_password_required'
	}

	if (!isValidPassword(password)) {
		return 'auth_validation_password_too_short'
	}

	return undefined
}

/**
 * Validates login form fields
 * Returns errors object or null if valid
 * @pure
 */
export const validateLoginForm = (email: string, password: string): LoginFormErrors | null => {
	const emailError = validateEmail(email)
	const passwordError = validatePassword(password)

	if (emailError || passwordError) {
		return {
			...(emailError && { email: emailError }),
			...(passwordError && { password: passwordError }),
		}
	}

	return null
}

/**
 * Checks if errors object has any errors
 * @pure
 */
export const hasErrors = (errors: LoginFormErrors): boolean => {
	return Object.keys(errors).length > 0
}

/**
 * Validates name field
 * Returns error key or undefined if valid
 * @pure
 */
export const validateName = (name: string): NameErrorKey | undefined => {
	const trimmed = name.trim()

	if (!trimmed) {
		return 'auth_validation_name_required'
	}

	if (trimmed.length < 2) {
		return 'auth_validation_name_too_short'
	}

	return undefined
}

/**
 * Validates password confirmation matches password
 * Returns error key or undefined if valid
 * @pure
 */
export const validateConfirmPassword = (
	password: string,
	confirmPassword: string,
): ConfirmPasswordErrorKey | undefined => {
	if (!confirmPassword) {
		return 'auth_validation_confirm_password_required'
	}

	if (password !== confirmPassword) {
		return 'auth_validation_passwords_do_not_match'
	}

	return undefined
}

/**
 * Validates signup form fields
 * Returns errors object or null if valid
 * @pure
 */
export const validateSignupForm = (
	email: string,
	password: string,
	confirmPassword: string,
	name: string,
): SignupFormErrors | null => {
	const emailError = validateEmail(email)
	const passwordError = validatePassword(password)
	const confirmPasswordError = validateConfirmPassword(password, confirmPassword)
	const nameError = validateName(name)

	if (emailError || passwordError || confirmPasswordError || nameError) {
		return {
			...(emailError && { email: emailError }),
			...(passwordError && { password: passwordError }),
			...(confirmPasswordError && { confirmPassword: confirmPasswordError }),
			...(nameError && { name: nameError }),
		}
	}

	return null
}
