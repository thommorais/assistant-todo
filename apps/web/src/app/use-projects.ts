import { useCallback, useEffect, useState } from 'react'
import type { Project } from '_/core/domain/project'
import type { ProjectFilter } from '_/core/ports/projects'
import { useContainer } from './container'

type ProjectsState =
	| { readonly status: 'loading' }
	| { readonly status: 'ready'; readonly projects: readonly Project[] }
	| { readonly status: 'failed'; readonly message: string }

export const useProjects = (filter?: ProjectFilter): ProjectsState => {
	const { projects } = useContainer()
	const [state, setState] = useState<ProjectsState>({ status: 'loading' })

	const key = JSON.stringify(filter ?? {})

	const load = useCallback(async () => {
		setState({ status: 'loading' })
		const result = await projects.list(JSON.parse(key) as ProjectFilter)

		setState(
			result.success
				? { status: 'ready', projects: result.value }
				: {
						status: 'failed',
						message: result.error instanceof Error ? result.error.message : 'Could not load projects',
					},
		)
	}, [projects, key])

	useEffect(() => {
		void load()
	}, [load])

	return state
}
