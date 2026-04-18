export interface NoteSource {
	id: string;
	name: string;
	/** Full path template without .md extension, e.g. "daily/YYYY/MM/YYYY-MM-DD" */
	pathTemplate: string;
	color: string;
}

export interface CalendarViewConfig {
	id: string;
	name: string;
	sources: NoteSource[];
}

export interface BiNoteSettings {
	calendarViews: CalendarViewConfig[];
}

export const DEFAULT_COLORS = [
	'#4a9eff',
	'#ff6b6b',
	'#51cf66',
	'#ffd43b',
	'#cc5de8',
	'#ff922b',
];

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
