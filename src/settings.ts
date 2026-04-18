import { App, PluginSettingTab, Setting } from 'obsidian';
import type BiNotePlugin from './main';
import {
	BiNoteSettings,
	CalendarViewConfig,
	NoteSource,
	DEFAULT_COLORS,
	generateId,
} from './types';

export type { BiNoteSettings };

export const DEFAULT_SETTINGS: BiNoteSettings = {
	confirmBeforeCreate: true,
	calendarViews: [
		{
			id: generateId(),
			name: 'Daily notes',
			sources: [
				{
					id: generateId(),
					name: 'A diary',
					pathTemplate: 'daily/YYYY/MM/YYYY-MM-DD',
					color: DEFAULT_COLORS[0] ?? '#4a9eff',
				},
				{
					id: generateId(),
					name: 'B diary',
					pathTemplate: 'daily-b/YYYY/MM/YYYY-MM-DD',
					color: DEFAULT_COLORS[1] ?? '#ff6b6b',
				},
			],
		},
	],
};

export class BiNoteSettingTab extends PluginSettingTab {
	plugin: BiNotePlugin;

	constructor(app: App, plugin: BiNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Calendar views').setHeading();

		new Setting(containerEl)
			.setName('Create note confirmation')
			.setDesc('点击缺失笔记时，先确认是否创建。')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.confirmBeforeCreate).onChange((value) => {
					this.plugin.settings.confirmBeforeCreate = value;
					void this.plugin.saveSettings();
				});
			});

		containerEl.createEl('p', {
			text: '配置日历视图及每个视图的笔记来源。',
			cls: 'bi-note-settings-desc',
		});

		const viewsContainer = containerEl.createDiv('bi-note-settings-views');
		this.renderCalendarViews(viewsContainer);

		const addBtn = containerEl.createEl('button', {
			text: '+ 添加日历视图',
			cls: 'bi-note-btn bi-note-btn-cta',
		});
		addBtn.addEventListener('click', () => {
			void this.addCalendarView();
		});
	}

	private async addCalendarView(): Promise<void> {
		const colorIndex = this.plugin.settings.calendarViews.length % DEFAULT_COLORS.length;
		const newView: CalendarViewConfig = {
			id: generateId(),
			name: 'New calendar view',
			sources: [
				{
					id: generateId(),
					name: 'Source A',
					pathTemplate: 'daily/YYYY/MM/YYYY-MM-DD',
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
		const card = container.createDiv('bi-note-settings-view-card');

		// ── Card header ───────────────────────────────────────────────────────
		const cardHeader = card.createDiv('bi-note-settings-view-header');

		const nameRow = cardHeader.createDiv('bi-note-settings-view-name');
		nameRow.createEl('span', { text: '视图名称', cls: 'bi-note-label' });

		const nameInput = nameRow.createEl('input', {
			cls: 'bi-note-view-name-input',
			attr: { type: 'text', value: config.name },
		});
		nameInput.addEventListener('change', () => {
			config.name = nameInput.value;
			void this.plugin.saveSettings();
		});

		const actions = cardHeader.createDiv('bi-note-settings-view-actions');

		const openBtn = actions.createEl('button', {
			text: '打开视图',
			cls: 'bi-note-btn',
		});
		openBtn.addEventListener('click', () => {
			void this.plugin.openCalendarView(config.id);
		});

		const deleteBtn = actions.createEl('button', {
			text: '删除',
			cls: 'bi-note-btn bi-note-btn-danger',
		});
		deleteBtn.addEventListener('click', () => {
			void this.deleteCalendarView(index);
		});

		// ── Sources ───────────────────────────────────────────────────────────
		card.createEl('div', { text: '笔记来源', cls: 'bi-note-settings-section-title' });

		const sourcesContainer = card.createDiv('bi-note-settings-sources');
		for (let j = 0; j < config.sources.length; j++) {
			const source = config.sources[j];
			if (source) {
				this.renderSourceConfig(sourcesContainer, config, source, j);
			}
		}

		const addSourceBtn = card.createEl('button', {
			text: '+ 添加笔记来源',
			cls: 'bi-note-btn bi-note-btn-secondary',
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
			name: `来源 ${String.fromCharCode(65 + config.sources.length)}`,
			pathTemplate: 'daily/YYYY/MM/YYYY-MM-DD',
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
		const row = container.createDiv('bi-note-settings-source-item');

		// Color picker
		const colorWrap = row.createDiv('bi-note-settings-source-color');
		const colorInput = colorWrap.createEl('input', {
			cls: 'bi-note-color-input',
			attr: { type: 'color', value: source.color },
		});
		colorInput.addEventListener('change', () => {
			source.color = colorInput.value;
			void this.plugin.saveSettings();
		});

		// Name field
		const nameField = row.createDiv('bi-note-settings-source-field');
		nameField.createEl('label', { text: '名称', cls: 'bi-note-field-label' });
		const nameInput = nameField.createEl('input', {
			cls: 'bi-note-text-input',
			attr: { type: 'text', value: source.name },
		});
		nameInput.addEventListener('change', () => {
			source.name = nameInput.value;
			void this.plugin.saveSettings();
		});

		// Path template field
		const pathField = row.createDiv('bi-note-settings-source-field bi-note-path-field');
		pathField.createEl('label', { text: '路径模板', cls: 'bi-note-field-label' });
		const pathInput = pathField.createEl('input', {
			cls: 'bi-note-text-input bi-note-path-input',
			attr: {
				type: 'text',
				value: source.pathTemplate,
				placeholder: 'e.g. daily/YYYY/MM/YYYY-MM-DD_ddd',
			},
		});
		pathInput.addEventListener('change', () => {
			source.pathTemplate = pathInput.value;
			void this.plugin.saveSettings();
		});
		pathField.createEl('div', {
			text: 'Uses common moment-style tokens such as YYYY, MM, DD, ddd, and dddd. Plain path text like daily/ stays literal, and .md is added automatically.',
			cls: 'bi-note-field-hint',
		});

		// Delete button
		const deleteWrap = row.createDiv('bi-note-settings-source-delete');
		const deleteBtn = deleteWrap.createEl('button', {
			text: '×',
			cls: 'bi-note-btn bi-note-btn-icon bi-note-btn-danger',
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
}
