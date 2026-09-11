import { createContext, useContext, useMemo } from 'react'
import { createThemeAdapter } from '_/adapters/browser/theme-adapter'
import { createAuthAdapter } from '_/adapters/pocketbase/auth-adapter'
import { createProjectsAdapter } from '_/adapters/pocketbase/projects-adapter'
import { createSearchAdapter } from '_/adapters/pocketbase/search-adapter'
import { createTodosAdapter } from '_/adapters/pocketbase/todos-adapter'
import type { AuthPort } from '_/core/ports/auth'
import type { ProjectsPort } from '_/core/ports/projects'
import type { SearchPort } from '_/core/ports/search'
import type { ThemePort } from '_/core/ports/theme'
import type { TodosPort } from '_/core/ports/todos'

export type Container = {
	readonly auth: AuthPort
	readonly projects: ProjectsPort
	readonly search: SearchPort
	readonly theme: ThemePort
	readonly todos: TodosPort
}

export const createContainer = (): Container => {
	const projects = createProjectsAdapter()

	return {
		auth: createAuthAdapter(),
		projects,
		search: createSearchAdapter(projects),
		theme: createThemeAdapter(),
		todos: createTodosAdapter(),
	}
}

const ContainerContext = createContext<Container | undefined>(undefined)

type ProviderProps = {
	readonly container?: Container
	readonly children: React.ReactNode
}

export const ContainerProvider = ({ container, children }: ProviderProps) => {
	const value = useMemo(() => container ?? createContainer(), [container])

	return <ContainerContext.Provider value={value}>{children}</ContainerContext.Provider>
}

export const useContainer = (): Container => {
	const container = useContext(ContainerContext)

	if (!container) {
		throw new Error('useContainer must be used inside a ContainerProvider')
	}

	return container
}
