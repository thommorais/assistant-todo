import { useCallback, useEffect, useState } from 'react'
import type { Project } from '_/core/domain/project'
import { useContainer } from './container'

type ProjectsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly projects: readonly Project[] }
	| { readonly status: 'failed'; readonly message: string }

export const useProjects = (options?: { readonly includeArchived?: boolean }): ProjectsState => {
	const { projects } = useContainer()
	const includeArchived = options?.includeArchived ?? false
	const [state, setState] = useState<ProjectsState>({ status: 'loading' })

	const load = useCallback(async () => {
		try {
			const result = await projects.list({ includeArchived })
			setState({ status: 'ready', projects: result })
		} catch (cause) {
			setState({ status: 'failed', message: cause instanceof Error ? cause.message : 'Could not load projects' })
		}
	}, [projects, includeArchived])

	useEffect(() => {
		void load()
	}, [load])

	return state
}
