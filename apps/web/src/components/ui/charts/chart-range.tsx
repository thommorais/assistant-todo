import { useI18n } from '_/i18n/config-client'
import type { LocaleKey } from '_/i18n/dictionaries/types'
import { useMemo, useState } from 'react'

export type RangeKey = '3m' | '6m' | '12m' | 'all'

const RANGE_MONTHS: Record<RangeKey, number | null> = { '3m': 3, '6m': 6, '12m': 12, all: null }
const RANGE_ORDER: ReadonlyArray<RangeKey> = ['3m', '6m', '12m', 'all']
const RANGE_LABEL: Record<RangeKey, LocaleKey> = {
	'3m': 'exams_chart_range_3m',
	'6m': 'exams_chart_range_6m',
	'12m': 'exams_chart_range_12m',
	all: 'exams_chart_range_all',
}

/**
 * useChartRange holds the selected period and the cutoff it implies. It lives at
 * the page level so one control governs every chart on the tab — a period picker
 * that filtered only some of them would misread as showing the whole history.
 */
export const useChartRange = (initial: RangeKey = '12m') => {
	const [range, setRange] = useState<RangeKey>(initial)

	// Recomputed per render rather than memoised on a clock: the cutoff only
	// matters at filter time, and pinning "now" would go stale in a long session.
	const cutoffMs = useMemo(() => {
		const months = RANGE_MONTHS[range]
		if (months === null) {
			return null
		}
		const cutoff = new Date()
		cutoff.setMonth(cutoff.getMonth() - months)
		return cutoff.getTime()
	}, [range])

	return { range, setRange, cutoffMs }
}

/** Filters anything carrying a timestamp to the selected period. */
export const withinRange = <T,>(items: ReadonlyArray<T>, cutoffMs: number | null, at: (item: T) => number) =>
	cutoffMs === null ? items : items.filter(item => at(item) >= cutoffMs)

type ChartRangePickerProps = {
	readonly range: RangeKey
	readonly onChange: (range: RangeKey) => void
}

export const ChartRangePicker = ({ range, onChange }: ChartRangePickerProps) => {
	const t = useI18n()

	return (
		<div className='flex items-center gap-2'>
			<span className='text-info-700/60 text-xs'>{t('exams_chart_range_label')}</span>
			<div
				className='inline-flex overflow-hidden rounded-md border border-black/10'
				role='group'
				aria-label={t('exams_chart_range_label')}
			>
				{RANGE_ORDER.map(key => (
					<button
						key={key}
						type='button'
						onClick={() => onChange(key)}
						aria-pressed={range === key}
						className={`px-3 py-1.5 text-xs transition-colors ${
							range === key
								? 'bg-primary-600 font-medium text-white'
								: 'text-info-700/70 bg-transparent hover:bg-black/5'
						}`}
					>
						{t(RANGE_LABEL[key])}
					</button>
				))}
			</div>
		</div>
	)
}
