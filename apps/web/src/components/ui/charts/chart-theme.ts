import { toCalendarDate } from '@thom/libs/date'
import type Highcharts from 'highcharts'

// Chart tokens, pinned to the design system in src/styles/tailwind.css. Highcharts
// needs concrete values, so the OKLCH tokens are resolved to hex here rather than
// read from CSS at runtime — one place to update if the palette moves.
//
// The palette was checked against the porcelain chart surface: line and status
// colors all clear 3:1 contrast, and high-vs-low separate at deltaE 15+ under
// protanopia. The brand's blues and greens are deliberately low-chroma, which
// means colour alone cannot carry meaning here — every out-of-range point also
// gets a distinct shape and a direct label. See references in the dataviz skill.
export const chartColors = {
	/** primary-700 — the single data line. */
	line: '#3a5c52',
	/** porcelain — the chart surface, used for rings that separate overlapping marks. */
	surface: '#f5f4ed',
	/** info-700 — primary ink for titles and values. */
	ink: '#15252e',
	/** info-400 — secondary ink for axes and labels. */
	inkMuted: '#3c6883',
	/** info-100 — recessive gridlines. */
	grid: '#c9dbe6',
	/** danger-700 — a reading above its reference range. */
	high: '#b44801',
	/** info-400 — a reading below its reference range. */
	low: '#3c6883',
	/** success-100 — the in-range band fill. */
	bandFill: 'rgba(129, 172, 86, 0.14)',
	/** success-700 — the band's edge, at low opacity. */
	bandEdge: 'rgba(96, 129, 64, 0.35)',
} as const

/**
 * baseOptions holds every setting shared by the pet charts: a recessive grid, ink
 * from text tokens rather than the series colour, and no chart junk. Spreading it
 * keeps each chart file to the part that is actually about its own data.
 */
export const baseOptions: Highcharts.Options = {
	chart: {
		backgroundColor: 'transparent',
		spacing: [8, 8, 8, 8],
		style: { fontFamily: 'inherit' },
	},
	title: {
		align: 'left',
		margin: 16,
		style: { fontSize: '0.875rem', fontWeight: '600', color: chartColors.ink },
	},
	subtitle: {
		align: 'left',
		style: { fontSize: '0.75rem', color: chartColors.inkMuted },
	},
	xAxis: {
		lineColor: chartColors.grid,
		tickColor: chartColors.grid,
		// One label per data point invites collisions; let Highcharts thin them.
		labels: { style: { fontSize: '0.6875rem', color: chartColors.inkMuted } },
		crosshair: { width: 1, color: chartColors.grid, dashStyle: 'Dash' },
	},
	yAxis: {
		gridLineColor: chartColors.grid,
		gridLineDashStyle: 'Dot',
		labels: { style: { fontSize: '0.6875rem', color: chartColors.inkMuted } },
		title: { style: { fontSize: '0.6875rem', color: chartColors.inkMuted } },
	},
	tooltip: {
		backgroundColor: '#ffffff',
		borderColor: chartColors.grid,
		borderRadius: 8,
		borderWidth: 1,
		shadow: false,
		padding: 10,
		style: { fontSize: '0.75rem', color: chartColors.ink },
		useHTML: true,
	},
	plotOptions: {
		series: {
			animation: { duration: 240 },
			states: { hover: { lineWidthPlus: 0, halo: { size: 6, opacity: 0.12 } } },
		},
	},
	credits: { enabled: false },
	accessibility: { enabled: false },
}

/**
 * Merges baseOptions with a chart's own options, one level deep per section, and
 * two levels for axis labels — an axis that sets its own `labels` (as timeAxis
 * does, for the formatter) must not drop the base label styling with it.
 */
export const withBase = (options: Highcharts.Options): Highcharts.Options => {
	const mergeAxis = <T extends Highcharts.XAxisOptions | Highcharts.YAxisOptions>(base: T, own: T | undefined): T => ({
		...base,
		...own,
		labels: { ...base.labels, ...own?.labels },
	})

	return {
		...baseOptions,
		...options,
		chart: { ...baseOptions.chart, ...options.chart },
		title: { ...baseOptions.title, ...options.title },
		subtitle: { ...baseOptions.subtitle, ...options.subtitle },
		xAxis: mergeAxis(baseOptions.xAxis as Highcharts.XAxisOptions, options.xAxis as Highcharts.XAxisOptions),
		yAxis: mergeAxis(baseOptions.yAxis as Highcharts.YAxisOptions, options.yAxis as Highcharts.YAxisOptions),
		tooltip: { ...baseOptions.tooltip, ...options.tooltip },
		plotOptions: { ...baseOptions.plotOptions, ...options.plotOptions },
	}
}

/**
 * marker returns the point style for a reading, so an out-of-range value is
 * legible without relying on colour: high points are triangles, low points are
 * inverted triangles, in-range points plain circles.
 */
export const statusMarker = (status: 'high' | 'low' | 'normal'): Highcharts.PointMarkerOptionsObject => {
	switch (status) {
		case 'high':
			return {
				symbol: 'triangle',
				radius: 5,
				fillColor: chartColors.high,
				lineColor: chartColors.surface,
				lineWidth: 2,
			}
		case 'low':
			return {
				symbol: 'triangle-down',
				radius: 5,
				fillColor: chartColors.low,
				lineColor: chartColors.surface,
				lineWidth: 2,
			}
		default:
			return { symbol: 'circle', radius: 4, fillColor: chartColors.line, lineColor: chartColors.surface, lineWidth: 2 }
	}
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * timeAxis returns the x-axis settings for a series recorded at `timestamps`,
 * in any order.
 *
 * Ticks sit on the readings themselves rather than on a calendar interval: these
 * series are sampled whenever someone happened to take a measurement, so a
 * regular grid labels dates that hold no data and skips the ones that do.
 *
 * Labelling every reading collides as soon as there are more than a handful —
 * eleven "7 de jun." labels in a row read as a ribbon, not as dates. So when the
 * readings outnumber the labels that fit, an evenly spaced subset is kept,
 * always including the first and last.
 */

// Highcharts lays labels out after measuring the real plot, which we cannot do
// here, so crowding is judged against a card-width plot: the narrowest case,
// and the one that collides.
const ASSUMED_PLOT_WIDTH_PX = 560
// "jun. de 26" at 0.6875rem is roughly this wide, plus breathing room.
const MIN_LABEL_WIDTH_PX = 78

/** Smallest gap between consecutive ticks, as a fraction of the whole span. */
const minGapFraction = (ticks: ReadonlyArray<number>): number => {
	if (ticks.length < 2) {
		return 1
	}
	const span = (ticks[ticks.length - 1] ?? 0) - (ticks[0] ?? 0)
	if (span <= 0) {
		return 1
	}
	let smallest = Number.POSITIVE_INFINITY
	for (let i = 1; i < ticks.length; i++) {
		smallest = Math.min(smallest, (ticks[i] ?? 0) - (ticks[i - 1] ?? 0))
	}
	return smallest / span
}

export const timeAxis = (locale: string, timestamps: ReadonlyArray<number>): Highcharts.XAxisOptions => {
	// Two readings on one day share an x position; ticking it twice stacks two
	// identical labels on the same pixel.
	const unique = [...new Set(timestamps)].sort((a, b) => a - b)

	const spanDays = Math.max(((unique[unique.length - 1] ?? 0) - (unique[0] ?? 0)) / DAY_MS, 1)

	// Above ~2 months the day of the month stops mattering; the month alone reads
	// faster and takes a third of the width.
	const showDay = spanDays <= 62
	const showYear = spanDays > 300
	const formatter = new Intl.DateTimeFormat(locale, {
		...(showDay ? { day: 'numeric', month: 'short' } : { month: 'short' }),
		...(showYear ? { year: '2-digit' } : {}),
	})

	// Roughly the count that fits a card-width plot without crowding.
	const MAX_LABELS = 6
	const step = Math.ceil(unique.length / MAX_LABELS)
	const thinned =
		step <= 1
			? unique
			: // Walk back from the newest so the last reading always keeps its label —
				// dropping it would leave the line running past its final date.
				unique.filter((_, i) => (unique.length - 1 - i) % step === 0)

	// Once the day is dropped, two readings in the same month format identically:
	// "jun. de 26" printed twice, a few pixels apart, is the overlap. Keep one
	// tick per distinct label — the newest, so the axis still ends at the last
	// reading. Every point keeps its exact date in the tooltip regardless.
	const tickPositions = showDay
		? thinned
		: [...new Map(thinned.map(t => [formatter.format(toCalendarDate(t)), t])).values()]

	// Whatever survives can still cluster: exams weeks apart inside a span of
	// years land close together however few labels there are. Staggering drops
	// alternating labels to a second row, doubling the width each one has.
	const closestGapPx = minGapFraction(tickPositions) * ASSUMED_PLOT_WIDTH_PX
	const staggerLines = closestGapPx < MIN_LABEL_WIDTH_PX ? 2 : undefined

	return {
		type: 'datetime',
		tickPositions,
		labels: {
			autoRotation: undefined,
			staggerLines,
			formatter: function () {
				return formatter.format(toCalendarDate(this.value as number))
			},
		},
	}
}

/** Formats a number for display without trailing noise. */
export const formatValue = (value: number, unit?: string): string => {
	const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 100) / 100
	const text = rounded.toLocaleString()
	return unit ? `${text} ${unit}` : text
}
