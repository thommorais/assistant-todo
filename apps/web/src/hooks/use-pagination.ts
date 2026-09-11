import { useMemo } from 'react'

export const DOTS = '...'

type PaginationProps = {
	total: number
	page: number
	siblingCount?: number
}

type PageItem = {
	key: string
	page: number | typeof DOTS
	dot?: typeof DOTS
}

const dotItem = (key: string): PageItem => ({ key, page: DOTS, dot: DOTS })
const pageItem = (page: number): PageItem => ({ key: `page-${page}`, page })

const buildRange = (active: number, total: number, siblingCount: number): PageItem[] => {
	const maxPage = Math.max(1, total)
	const items: PageItem[] = [pageItem(active)]

	for (let i = 1; i <= siblingCount; i++) {
		if (active - i >= 1) items.unshift(pageItem(active - i))
		if (active + i <= maxPage) items.push(pageItem(active + i))
	}

	const firstPage = (items[0]?.page as number) ?? 1
	const lastPage = (items[items.length - 1]?.page as number) ?? maxPage

	if (firstPage > 2) items.unshift(dotItem('dots-start'))
	if (firstPage > 1) items.unshift(pageItem(1))
	if (lastPage < maxPage - 1) items.push(dotItem('dots-end'))
	if (lastPage < maxPage) items.push(pageItem(maxPage))

	return items
}

export const usePagination = ({ total, page, siblingCount = 2 }: PaginationProps) => {
	const active = Math.min(Math.max(1, page), Math.max(1, total))

	const range = useMemo(() => buildRange(active, total, siblingCount), [active, total, siblingCount])

	return { active, range }
}
