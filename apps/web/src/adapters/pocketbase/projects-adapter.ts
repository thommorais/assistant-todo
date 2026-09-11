import type { Member, Project, Role } from '_/core/domain/project'
import { projectId, userId } from '_/core/domain/project'
import type { ProjectsPort } from '_/core/ports/projects'
import { journUrl, pb } from './client'

type MemberView = {
	user_id: string
	email?: string
	name?: string
	role: string
}

type ProjectView = {
	id: string
	slug: string
	name: string
	descr?: string
	archived: boolean
	members: MemberView[]
	created_at: string
	updated_at: string
}

const toMember = (view: MemberView): Member => ({
	userId: userId(view.user_id),
	role: view.role as Role,
	email: view.email ?? '',
	name: view.name ?? '',
})

const toProject = (view: ProjectView): Project => ({
	id: projectId(view.id),
	slug: view.slug,
	name: view.name,
	descr: view.descr ?? '',
	archived: view.archived,
	members: view.members.map(toMember),
	createdAt: new Date(view.created_at),
	updatedAt: new Date(view.updated_at),
})

const request = async <T>(path: string): Promise<T> => {
	const response = await fetch(journUrl(path), {
		headers: { Authorization: pb.authStore.token },
	})

	if (!response.ok) {
		throw new Error(`${response.status} ${response.statusText}`)
	}

	return response.json() as Promise<T>
}

export const createProjectsAdapter = (): ProjectsPort => ({
	list: async options => {
		const query = options?.includeArchived ? '?archived=true' : ''
		const body = await request<{ projects: ProjectView[] }>(`/projects${query}`)
		return body.projects.map(toProject)
	},

	get: async ref => toProject(await request<ProjectView>(`/projects/${ref}`)),
})
