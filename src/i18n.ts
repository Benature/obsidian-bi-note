import type { BiNoteLanguage } from './types';

export type ResolvedLanguage = 'zh-CN' | 'en';

type TranslationKey =
	| 'main.ribbonTooltip'
	| 'main.openCalendarCommand'
	| 'settings.calendarViewsHeading'
	| 'settings.language.name'
	| 'settings.language.desc'
	| 'settings.language.option.system'
	| 'settings.language.option.zh-CN'
	| 'settings.language.option.en'
	| 'settings.confirmBeforeCreate.name'
	| 'settings.confirmBeforeCreate.desc'
	| 'settings.sourceIndicatorHeight.name'
	| 'settings.sourceIndicatorHeight.desc'
	| 'settings.dayCellMinHeight.name'
	| 'settings.dayCellMinHeight.desc'
	| 'settings.calendarViewsDesc'
	| 'settings.addCalendarView'
	| 'settings.pathTemplateHint'
	| 'settings.newCalendarView'
	| 'settings.newSource'
	| 'settings.viewName'
	| 'settings.openView'
	| 'settings.delete'
	| 'settings.noteSources'
	| 'settings.addSource'
	| 'settings.sourceName'
	| 'settings.pathTemplate'
	| 'settings.pathTemplatePlaceholder'
	| 'calendar.defaultTitle'
	| 'calendar.configMissing'
	| 'calendar.today'
	| 'calendar.missingNoteSuffix'
	| 'calendar.createNoteFailed'
	| 'calendar.confirmCreateTitle'
	| 'calendar.confirmCreateDesc'
	| 'calendar.cancel'
	| 'calendar.create';

const translations: Record<ResolvedLanguage, Record<TranslationKey, string>> = {
	'zh-CN': {
		'main.ribbonTooltip': 'Bi-Note 日历',
		'main.openCalendarCommand': '打开日历：{{name}}',
		'settings.calendarViewsHeading': '日历视图',
		'settings.language.name': '语言',
		'settings.language.desc': '设置插件界面的显示语言。',
		'settings.language.option.system': '跟随系统',
		'settings.language.option.zh-CN': '中文',
		'settings.language.option.en': 'English',
		'settings.confirmBeforeCreate.name': '创建笔记前确认',
		'settings.confirmBeforeCreate.desc': '点击缺失笔记时，先确认是否创建。',
		'settings.sourceIndicatorHeight.name': '来源格高度',
		'settings.sourceIndicatorHeight.desc':
			'设置所有日历视图里每个笔记来源小格的高度（像素）。',
		'settings.dayCellMinHeight.name': '日期格最低高度',
		'settings.dayCellMinHeight.desc':
			'设置所有日历视图中每天那个大格子的最低高度（像素）。',
		'settings.calendarViewsDesc': '配置日历视图及每个视图的笔记来源。',
		'settings.addCalendarView': '+ 添加日历视图',
		'settings.pathTemplateHint':
			'路径模板支持常见的 moment 风格占位符，例如 YYYY、MM、DD、ddd、dddd。像 daily/ 这样的普通路径文本会原样保留，并会自动补上 .md 后缀。',
		'settings.newCalendarView': '新日历视图',
		'settings.newSource': '来源 {{label}}',
		'settings.viewName': '视图名称',
		'settings.openView': '打开视图',
		'settings.delete': '删除',
		'settings.noteSources': '笔记来源',
		'settings.addSource': '+ 添加笔记来源',
		'settings.sourceName': '名称',
		'settings.pathTemplate': '路径模板',
		'settings.pathTemplatePlaceholder': '例如：daily/YYYY/MM/YYYY-MM-DD_ddd',
		'calendar.defaultTitle': '日历',
		'calendar.configMissing': '未找到日历配置，请在插件设置中检查。',
		'calendar.today': '今天',
		'calendar.missingNoteSuffix': '（未创建）',
		'calendar.createNoteFailed': '创建笔记失败：{{path}}',
		'calendar.confirmCreateTitle': '创建笔记？',
		'calendar.confirmCreateDesc': '目标文件不存在，是否创建并打开？',
		'calendar.cancel': '取消',
		'calendar.create': '创建',
	},
	en: {
		'main.ribbonTooltip': 'Bi-Note calendar',
		'main.openCalendarCommand': 'Open calendar: {{name}}',
		'settings.calendarViewsHeading': 'Calendar views',
		'settings.language.name': 'Language',
		'settings.language.desc': 'Choose which language the plugin UI uses.',
		'settings.language.option.system': 'Follow system',
		'settings.language.option.zh-CN': 'Chinese',
		'settings.language.option.en': 'English',
		'settings.confirmBeforeCreate.name': 'Create note confirmation',
		'settings.confirmBeforeCreate.desc':
			'Ask for confirmation before creating a missing note.',
		'settings.sourceIndicatorHeight.name': 'Source cell height',
		'settings.sourceIndicatorHeight.desc':
			'Set the height of each source indicator cell in all calendar views (px).',
		'settings.dayCellMinHeight.name': 'Day cell minimum height',
		'settings.dayCellMinHeight.desc':
			'Set the minimum height of each day cell in all calendar views (px).',
		'settings.calendarViewsDesc':
			'Configure calendar views and the note sources shown in each view.',
		'settings.addCalendarView': '+ Add calendar view',
		'settings.pathTemplateHint':
			'Path templates support common moment-style tokens like YYYY, MM, DD, ddd, and dddd. Plain path text such as daily/ is kept as-is, and .md is appended automatically.',
		'settings.newCalendarView': 'New calendar view',
		'settings.newSource': 'Source {{label}}',
		'settings.viewName': 'View name',
		'settings.openView': 'Open view',
		'settings.delete': 'Delete',
		'settings.noteSources': 'Note sources',
		'settings.addSource': '+ Add note source',
		'settings.sourceName': 'Name',
		'settings.pathTemplate': 'Path template',
		'settings.pathTemplatePlaceholder': 'e.g. daily/YYYY/MM/YYYY-MM-DD_ddd',
		'calendar.defaultTitle': 'Calendar',
		'calendar.configMissing': 'Calendar config not found. Check the plugin settings.',
		'calendar.today': 'Today',
		'calendar.missingNoteSuffix': ' (missing)',
		'calendar.createNoteFailed': 'Failed to create note: {{path}}',
		'calendar.confirmCreateTitle': 'Create note?',
		'calendar.confirmCreateDesc': 'The target file does not exist. Create and open it?',
		'calendar.cancel': 'Cancel',
		'calendar.create': 'Create',
	},
};

const WEEKDAY_LABELS: Record<ResolvedLanguage, string[]> = {
	'zh-CN': ['日', '一', '二', '三', '四', '五', '六'],
	en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export function resolveLanguage(language: BiNoteLanguage): ResolvedLanguage {
	if (language === 'zh-CN' || language === 'en') {
		return language;
	}

	const obsidianLanguage =
		typeof window !== 'undefined' ? window.localStorage.getItem('language') : null;
	const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : '';
	return normalizeLanguage(obsidianLanguage) ?? normalizeLanguage(browserLanguage) ?? 'en';
}

export function getWeekdayLabels(language: ResolvedLanguage): string[] {
	return WEEKDAY_LABELS[language];
}

export function formatMonthLabel(date: Date, language: ResolvedLanguage): string {
	const locale = language === 'zh-CN' ? 'zh-CN' : 'en-US';
	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
	}).format(date);
}

export function t(
	language: ResolvedLanguage,
	key: TranslationKey,
	vars?: Record<string, string>,
): string {
	const template = translations[language][key];
	if (!vars) {
		return template;
	}

	return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => vars[name] ?? '');
}

function normalizeLanguage(value: string | null | undefined): ResolvedLanguage | null {
	if (!value) {
		return null;
	}

	return value.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}
