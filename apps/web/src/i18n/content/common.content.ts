import { type Dictionary, t } from 'intlayer'

const content = {
	key: 'common',
	content: {
		auth_field_name: t({ en: 'Name', pt: 'Nome' }),
		auth_field_name_placeholder: t({ en: 'Enter your name', pt: 'Digite seu nome' }),
		auth_field_email: t({ en: 'Email', pt: 'E-mail' }),
		auth_field_email_placeholder: t({ en: 'Enter your email', pt: 'Digite seu e-mail' }),
		auth_field_password: t({ en: 'Password', pt: 'Senha' }),
		auth_field_password_placeholder: t({ en: 'Enter your password', pt: 'Digite sua senha' }),
		auth_field_password_create_placeholder: t({ en: 'Create a password', pt: 'Crie uma senha' }),
		auth_field_confirm_password: t({ en: 'Confirm Password', pt: 'Confirmar senha' }),
		auth_field_confirm_password_placeholder: t({ en: 'Confirm your password', pt: 'Confirme sua senha' }),
		auth_sign_in: t({ en: 'Sign In', pt: 'Entrar' }),
		auth_sign_up: t({ en: 'Create Account', pt: 'Criar conta' }),
		auth_validation_email_required: t({ en: 'Email is required.', pt: 'O e-mail é obrigatório.' }),
		auth_validation_email_invalid: t({ en: 'Enter a valid email.', pt: 'Digite um e-mail válido.' }),
		auth_validation_password_required: t({ en: 'Password is required.', pt: 'A senha é obrigatória.' }),
		auth_validation_password_too_short: t({
			en: 'Password must be at least 8 characters.',
			pt: 'A senha deve ter ao menos 8 caracteres.',
		}),
		auth_validation_name_required: t({ en: 'Name is required.', pt: 'O nome é obrigatório.' }),
		auth_validation_name_too_short: t({
			en: 'Name must be at least 2 characters.',
			pt: 'O nome deve ter ao menos 2 caracteres.',
		}),
		auth_validation_confirm_password_required: t({
			en: 'Confirm your password.',
			pt: 'Confirme sua senha.',
		}),
		auth_validation_passwords_do_not_match: t({
			en: 'The passwords do not match.',
			pt: 'As senhas não são iguais.',
		}),
		save: t({ en: 'Save', pt: 'Salvar' }),
		save_changes: t({ en: 'Save Changes', pt: 'Salvar Alterações' }),
		cancel: t({ en: 'Cancel', pt: 'Cancelar' }),
		edit: t({ en: 'Edit', pt: 'Editar' }),
		delete: t({ en: 'Delete', pt: 'Excluir' }),
		remove: t({ en: 'Remove', pt: 'Remover' }),
		close: t({ en: 'Close', pt: 'Fechar' }),
		exit: t({ en: 'Exit', pt: 'Sair' }),
		search: t({ en: 'Search', pt: 'Buscar' }),
		sign_out: t({ en: 'Sign out', pt: 'Sair' }),
		search_no_results: t({ en: 'No results found', pt: 'Nenhum resultado encontrado' }),
		name: t({ en: 'Name', pt: 'Nome' }),
		email: t({ en: 'Email', pt: 'E-mail' }),
		phone: t({ en: 'Phone', pt: 'Telefone' }),
		address: t({ en: 'Address', pt: 'Endereço' }),
		notes: t({ en: 'Notes', pt: 'Observações' }),
		back: t({ en: 'Back', pt: 'Voltar' }),
		login: t({ en: 'Sign in', pt: 'Entrar' }),
	},
} satisfies Dictionary

// oxlint-disable-next-line import/no-default-export -- intlayer content
export default content
