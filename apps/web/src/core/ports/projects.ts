import type { Result } from '_/lib/result'
import type { Project } from '../domain/project'

export type ProjectFilter = {
	readonly includeArchived?: boolean
	readonly search?: string
	readonly limit?: number
	readonly offset?: number
}

export type ProjectsPort = {
	readonly list: (filter?: ProjectFilter) => Promise<Result<readonly Project[]>>
	readonly get: (ref: string) => Promise<Result<Project>>
}
