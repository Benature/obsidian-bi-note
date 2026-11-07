import { App, PluginSettingTab, Setting } from 'obsidian';
import type ParallelNotesPlugin from './main';
import { resolveLanguage, t } from './i18n';
import {
	ParallelNotesSettings,
	CalendarViewConfig,
	NoteSource,
	DEFAULT_COLORS,
	DEFAULT_DAY_CELL_MIN_HEIGHT,
	DEFAULT_SOURCE_INDICATOR_HEIGHT,
	generateId,
	MAX_DAY_CELL_MIN_HEIGHT,
	MAX_SOURCE_INDICATOR_HEIGHT,
	MIN_DAY_CELL_MIN_HEIGHT,
	MIN_SOURCE_INDICATOR_HEIGHT,
	normalizeDayCellMinHeight,
	normalizeSourceIndicatorHeight,
} from './types';

export type { ParallelNotesSettings };

export const DEFAULT_SETTINGS: ParallelNotesSettings = {
	confirmBeforeCreate: true,
	globalSourceIndicatorHeight: DEFAULT_SOURCE_INDICATOR_HEIGHT,
	globalDayCellMinHeight: DEFAULT_DAY_CELL_MIN_HEIGHT,
	language: 'system',
	calendarViews: [
		{
			id: generateId(),
			name: 'Daily notes',
			sources: [
				{
					id: generateId(),
					name: 'A diary',
					pathTemplate: 'daily/{YYYY}/{MM}/{YYYY-MM-DD}',
					color: DEFAULT_COLORS[0] ?? '#4a9eff',
				},
				{
					id: generateId(),
					name: 'B diary',
					pathTemplate: 'daily-b/{YYYY}/{MM}/{YYYY-MM-DD}',
					color: DEFAULT_COLORS[1] ?? '#ff6b6b',
				},
			],
		},
	],
};

export class ParallelNotesSettingTab extends PluginSettingTab {
	plugin: ParallelNotesPlugin;

	constructor(app: App, plugin: ParallelNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const language = resolveLanguage(this.plugin.settings.language);
		const tr = (key: Parameters<typeof t>[1], vars?: Record<string, string>) =>
			t(language, key, vars);

		new Setting(containerEl).setName(tr('settings.calendarViewsHeading')).setHeading();

		new Setting(containerEl)
			.setName(tr('settings.language.name'))
			.setDesc(tr('settings.language.desc'))
			.addDropdown((dropdown) => {
				dropdown
					.addOption('system', tr('settings.language.option.system'))
					.addOption('zh-CN', tr('settings.language.option.zh-CN'))
					.addOption('en', tr('settings.language.option.en'))
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						this.plugin.settings.language = value as ParallelNotesSettings['language'];
						await this.plugin.saveSettings();
						this.display();
					});
			});

		new Setting(containerEl)
			.setName(tr('settings.confirmBeforeCreate.name'))
			.setDesc(tr('settings.confirmBeforeCreate.desc'))
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.confirmBeforeCreate).onChange((value) => {
					this.plugin.settings.confirmBeforeCreate = value;
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(tr('settings.sourceIndicatorHeight.name'))
			.setDesc(tr('settings.sourceIndicatorHeight.desc'))
			.addText((text) => {
				text.inputEl.type = 'number';
				text.inputEl.min = String(MIN_SOURCE_INDICATOR_HEIGHT);
				text.inputEl.max = String(MAX_SOURCE_INDICATOR_HEIGHT);
				text.inputEl.step = '1';
				text.inputEl.addClass('parallel-notes-number-input');
				text.setValue(
					String(
						normalizeSourceIndicatorHeight(this.plugin.settings.globalSourceIndicatorHeight),
					),
				).onChange((value) => {
					this.plugin.settings.globalSourceIndicatorHeight =
						normalizeSourceIndicatorHeight(value);
					text.setValue(String(this.plugin.settings.globalSourceIndicatorHeight));
					void this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(tr('settings.dayCellMinHeight.name'))
			.setDesc(tr('settings.dayCellMinHeight.desc'))
			.addText((text) => {
				text.inputEl.type = 'number';
				text.inputEl.min = String(MIN_DAY_CELL_MIN_HEIGHT);
				text.inputEl.max = String(MAX_DAY_CELL_MIN_HEIGHT);
				text.inputEl.step = '1';
				text.inputEl.addClass('parallel-notes-number-input');
				text.setValue(
					String(normalizeDayCellMinHeight(this.plugin.settings.globalDayCellMinHeight)),
				).onChange((value) => {
					this.plugin.settings.globalDayCellMinHeight = normalizeDayCellMinHeight(value);
					text.setValue(String(this.plugin.settings.globalDayCellMinHeight));
					void this.plugin.saveSettings();
				});
			});

		containerEl.createEl('p', {
			text: tr('settings.calendarViewsDesc'),
			cls: 'parallel-notes-settings-desc',
		});

		const viewsContainer = containerEl.createDiv('parallel-notes-settings-views');
		this.renderCalendarViews(viewsContainer);

		const addBtn = containerEl.createEl('button', {
			text: tr('settings.addCalendarView'),
			cls: 'parallel-notes-btn parallel-notes-btn-cta',
		});
		addBtn.addEventListener('click', () => {
			void this.addCalendarView();
		});

		containerEl.createEl('div', {
			cls: 'parallel-notes-settings-footer-divider',
		});
		containerEl.createEl('div', {
			text: tr('settings.pathTemplateHint'),
			cls: 'parallel-notes-field-hint',
		});
	}

	private async addCalendarView(): Promise<void> {
		const colorIndex = this.plugin.settings.calendarViews.length % DEFAULT_COLORS.length;
		const newView: CalendarViewConfig = {
			id: generateId(),
			name: this.plugin.t('settings.newCalendarView'),
			sources: [
				{
					id: generateId(),
					name: this.plugin.t('settings.newSource', { label: 'A' }),
					pathTemplate: 'daily/{YYYY}/{MM}/{YYYY-MM-DD}',
					color: DEFAULT_COLORS[colorIndex] ?? '#4a9eff',
				},
			],
		};
		this.plugin.settings.calendarViews.push(newView);
		await this.plugin.saveSettings();
		this.display();
	}

	private renderCalendarViews(container: HTMLElement): void {
		container.empty();
		const views = this.plugin.settings.calendarViews;
		for (let i = 0; i < views.length; i++) {
			const config = views[i];
			if (config) {
				this.renderCalendarViewConfig(container, config, i);
			}
		}
	}

	private renderCalendarViewConfig(
		container: HTMLElement,
		config: CalendarViewConfig,
		index: number,
	): void {
		const card = container.createDiv('parallel-notes-settings-view-card');
		const tr = this.plugin.t.bind(this.plugin);

		// ── Card header ───────────────────────────────────────────────────────
		const cardHeader = card.createDiv('parallel-notes-settings-view-header');

		const nameRow = cardHeader.createDiv('parallel-notes-settings-view-name');
		nameRow.createEl('span', { text: tr('settings.viewName'), cls: 'parallel-notes-label' });

		const nameInput = nameRow.createEl('input', {
			cls: 'parallel-notes-view-name-input',
			attr: { type: 'text', value: config.name },
		});
		nameInput.addEventListener('change', () => {
			config.name = nameInput.value;
			void this.plugin.saveSettings();
		});

		const actions = cardHeader.createDiv('parallel-notes-settings-view-actions');

		const openBtn = actions.createEl('button', {
			text: tr('settings.openView'),
			cls: 'parallel-notes-btn',
		});
		openBtn.addEventListener('click', () => {
			void this.plugin.openCalendarView(config.id);
		});

		const deleteBtn = actions.createEl('button', {
			text: tr('settings.delete'),
			cls: 'parallel-notes-btn parallel-notes-btn-danger',
		});
		deleteBtn.addEventListener('click', () => {
			void this.deleteCalendarView(index);
		});

		// ── Sources ───────────────────────────────────────────────────────────
		card.createEl('div', {
			text: tr('settings.noteSources'),
			cls: 'parallel-notes-settings-section-title',
		});

		const sourcesContainer = card.createDiv('parallel-notes-settings-sources');
		for (let j = 0; j < config.sources.length; j++) {
			const source = config.sources[j];
			if (source) {
				this.renderSourceConfig(sourcesContainer, config, source, j);
			}
		}

		const addSourceBtn = card.createEl('button', {
			text: tr('settings.addSource'),
			cls: 'parallel-notes-btn parallel-notes-btn-secondary',
		});
		addSourceBtn.addEventListener('click', () => {
			void this.addSource(config);
		});
	}

	private async deleteCalendarView(index: number): Promise<void> {
		this.plugin.settings.calendarViews.splice(index, 1);
		await this.plugin.saveSettings();
		this.display();
	}

	private async addSource(config: CalendarViewConfig): Promise<void> {
		const colorIndex = config.sources.length % DEFAULT_COLORS.length;
		const newSource: NoteSource = {
			id: generateId(),
			name: this.plugin.t('settings.newSource', {
				label: String.fromCharCode(65 + config.sources.length),
			}),
			pathTemplate: 'daily/{YYYY}/{MM}/{YYYY-MM-DD}',
			color: DEFAULT_COLORS[colorIndex] ?? '#4a9eff',
		};
		config.sources.push(newSource);
		await this.plugin.saveSettings();
		this.display();
	}

	private renderSourceConfig(
		container: HTMLElement,
		config: CalendarViewConfig,
		source: NoteSource,
		sourceIndex: number,
	): void {
		const row = container.createDiv('parallel-notes-settings-source-item');
		const tr = this.plugin.t.bind(this.plugin);

		// Color picker
		const colorWrap = row.createDiv('parallel-notes-settings-source-color');
		const colorInput = colorWrap.createEl('input', {
			cls: 'parallel-notes-color-input',
			attr: { type: 'color', value: source.color },
		});
		colorInput.addEventListener('change', () => {
			source.color = colorInput.value;
			void this.plugin.saveSettings();
		});

		// Name field
		const nameField = row.createDiv('parallel-notes-settings-source-field');
		nameField.createEl('label', { text: tr('settings.sourceName'), cls: 'parallel-notes-field-label' });
		const nameInput = nameField.createEl('input', {
			cls: 'parallel-notes-text-input',
			attr: { type: 'text', value: source.name },
		});
		nameInput.addEventListener('change', () => {
			source.name = nameInput.value;
			void this.plugin.saveSettings();
		});

		// Path template field
		const pathField = row.createDiv('parallel-notes-settings-source-field parallel-notes-path-field');
		pathField.createEl('label', { text: tr('settings.pathTemplate'), cls: 'parallel-notes-field-label' });
		const pathInput = pathField.createEl('input', {
			cls: 'parallel-notes-text-input parallel-notes-path-input',
			attr: {
				type: 'text',
				value: source.pathTemplate,
				placeholder: tr('settings.pathTemplatePlaceholder'),
			},
		});
		pathInput.addEventListener('change', () => {
			source.pathTemplate = pathInput.value;
			void this.plugin.saveSettings();
		});

		const actionsWrap = row.createDiv('parallel-notes-settings-source-actions');

		const moveUpBtn = actionsWrap.createEl('button', {
			text: '↑',
			cls: 'parallel-notes-btn parallel-notes-btn-icon',
		});
		moveUpBtn.disabled = sourceIndex === 0;
		moveUpBtn.addEventListener('click', () => {
			void this.moveSource(config, sourceIndex, -1);
		});

		const moveDownBtn = actionsWrap.createEl('button', {
			text: '↓',
			cls: 'parallel-notes-btn parallel-notes-btn-icon',
		});
		moveDownBtn.disabled = sourceIndex === config.sources.length - 1;
		moveDownBtn.addEventListener('click', () => {
			void this.moveSource(config, sourceIndex, 1);
		});

		// Delete button
		const deleteBtn = actionsWrap.createEl('button', {
			text: '×',
			cls: 'parallel-notes-btn parallel-notes-btn-icon parallel-notes-btn-danger',
		});
		deleteBtn.addEventListener('click', () => {
			void this.deleteSource(config, sourceIndex);
		});
	}

	private async deleteSource(config: CalendarViewConfig, sourceIndex: number): Promise<void> {
		config.sources.splice(sourceIndex, 1);
		await this.plugin.saveSettings();
		this.display();
	}

	private async moveSource(
		config: CalendarViewConfig,
		sourceIndex: number,
		direction: -1 | 1,
	): Promise<void> {
		const targetIndex = sourceIndex + direction;
		if (targetIndex < 0 || targetIndex >= config.sources.length) {
			return;
		}

		const [source] = config.sources.splice(sourceIndex, 1);
		if (!source) {
			return;
		}

		config.sources.splice(targetIndex, 0, source);
		await this.plugin.saveSettings();
		this.display();
	}
}
