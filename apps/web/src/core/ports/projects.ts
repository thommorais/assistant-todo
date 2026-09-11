import type { Project } from '../domain/project'

export type ProjectsPort = {
	readonly list: (options?: { readonly includeArchived?: boolean }) => Promise<readonly Project[]>
	readonly get: (ref: string) => Promise<Project>
}
