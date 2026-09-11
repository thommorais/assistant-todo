import { projectId as toProjectId } from '_/core/domain/project'
import type { ProjectsPort } from '_/core/ports/projects'
import type { SearchHit, SearchKind, SearchPort, SearchQuery } from '_/core/ports/search'
import { journUrl, pb } from './client'

type SearchHitView = {
	kind: string
	id: string
	project_id: string
	title: string
	snippet?: string
	tags: string[]
	created_at: string
}

const DEFAULT_LIMIT = 20

export const createSearchAdapter = (projects: ProjectsPort): SearchPort => ({
	// No cross-project search route exists, so a global palette fans out and
	// merges. The API rejects a query carrying neither q nor tags.
	search: async ({ text, kinds, limit = DEFAULT_LIMIT }: SearchQuery) => {
		const term = text.trim()
		if (term === '') return []

		const members = await projects.list()

		const params = new URLSearchParams({ q: term, limit: String(limit) })
		if (kinds && kinds.length > 0) params.set('kind', kinds.join(','))

		const perProject = await Promise.all(
			members.map(async project => {
				try {
					const response = await fetch(journUrl(`/projects/${project.id}/search?${params.toString()}`), {
						headers: { Authorization: pb.authStore.token },
					})
					if (!response.ok) return []

					const body = (await response.json()) as { hits?: SearchHitView[] }

					return (body.hits ?? []).map((hit): SearchHit => ({
						kind: hit.kind as SearchKind,
						id: hit.id,
						projectId: toProjectId(hit.project_id),
						projectSlug: project.slug,
						title: hit.title,
						snippet: hit.snippet ?? '',
						tags: hit.tags ?? [],
						createdAt: new Date(hit.created_at),
					}))
				} catch {
					return []
				}
			}),
		)

		return perProject
			.flat()
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.slice(0, limit)
	},
})
