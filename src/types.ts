export interface NoteSource {
	id: string;
	name: string;
	/** Full path template without .md extension, e.g. "daily/YYYY/MM/YYYY-MM-DD_ddd". */
	pathTemplate: string;
	color: string;
}

export interface CalendarViewConfig {
	id: string;
	name: string;
	sources: NoteSource[];
	sourceIndicatorHeight?: number;
	dayCellMinHeight?: number;
}

export interface BiNoteSettings {
	calendarViews: CalendarViewConfig[];
	confirmBeforeCreate: boolean;
	globalSourceIndicatorHeight: number;
	globalDayCellMinHeight: number;
	language: BiNoteLanguage;
}

export type BiNoteLanguage = 'system' | 'zh-CN' | 'en';

export const DEFAULT_COLORS = [
	'#4a9eff',
	'#ff6b6b',
	'#51cf66',
	'#ffd43b',
	'#cc5de8',
	'#ff922b',
];

export const DEFAULT_SOURCE_INDICATOR_HEIGHT = 8;
export const MIN_SOURCE_INDICATOR_HEIGHT = 2;
export const MAX_SOURCE_INDICATOR_HEIGHT = 48;
export const DEFAULT_DAY_CELL_MIN_HEIGHT = 22;
export const MIN_DAY_CELL_MIN_HEIGHT = 16;
export const MAX_DAY_CELL_MIN_HEIGHT = 160;

export function normalizeSourceIndicatorHeight(value: unknown): number {
	const numericValue =
		typeof value === 'number'
			? value
			: typeof value === 'string'
				? Number.parseInt(value, 10)
				: Number.NaN;

	if (!Number.isFinite(numericValue)) {
		return DEFAULT_SOURCE_INDICATOR_HEIGHT;
	}

	return Math.min(
		MAX_SOURCE_INDICATOR_HEIGHT,
		Math.max(MIN_SOURCE_INDICATOR_HEIGHT, Math.round(numericValue)),
	);
}

export function normalizeDayCellMinHeight(value: unknown): number {
	const numericValue =
		typeof value === 'number'
			? value
			: typeof value === 'string'
				? Number.parseInt(value, 10)
				: Number.NaN;

	if (!Number.isFinite(numericValue)) {
		return DEFAULT_DAY_CELL_MIN_HEIGHT;
	}

	return Math.min(
		MAX_DAY_CELL_MIN_HEIGHT,
		Math.max(MIN_DAY_CELL_MIN_HEIGHT, Math.round(numericValue)),
	);
}

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
