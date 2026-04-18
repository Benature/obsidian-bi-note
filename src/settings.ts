import { App, PluginSettingTab, Setting } from 'obsidian';
import type BiNotePlugin from './main';
import {
	BiNoteSettings,
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

export type { BiNoteSettings };

export const DEFAULT_SETTINGS: BiNoteSettings = {
	confirmBeforeCreate: true,
	globalSourceIndicatorHeight: DEFAULT_SOURCE_INDICATOR_HEIGHT,
	globalDayCellMinHeight: DEFAULT_DAY_CELL_MIN_HEIGHT,
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

		new Setting(containerEl)
			.setName('来源格高度')
			.setDesc('设置所有日历视图里每个笔记来源小格的高度（像素）。')
			.addText((text) => {
				text.inputEl.type = 'number';
				text.inputEl.min = String(MIN_SOURCE_INDICATOR_HEIGHT);
				text.inputEl.max = String(MAX_SOURCE_INDICATOR_HEIGHT);
				text.inputEl.step = '1';
				text.inputEl.addClass('bi-note-number-input');
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
			.setName('日期格最低高度')
			.setDesc('设置所有日历视图中每天那个大格子的最低高度（像素）。')
			.addText((text) => {
				text.inputEl.type = 'number';
				text.inputEl.min = String(MIN_DAY_CELL_MIN_HEIGHT);
				text.inputEl.max = String(MAX_DAY_CELL_MIN_HEIGHT);
				text.inputEl.step = '1';
				text.inputEl.addClass('bi-note-number-input');
				text.setValue(
					String(normalizeDayCellMinHeight(this.plugin.settings.globalDayCellMinHeight)),
				).onChange((value) => {
					this.plugin.settings.globalDayCellMinHeight = normalizeDayCellMinHeight(value);
					text.setValue(String(this.plugin.settings.globalDayCellMinHeight));
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

		containerEl.createEl('div', {
			cls: 'bi-note-settings-footer-divider',
		});
		containerEl.createEl('div', {
			text: '路径模板支持常见的 moment 风格占位符，例如 YYYY、MM、DD、ddd、dddd。像 daily/ 这样的普通路径文本会原样保留，并会自动补上 .md 后缀。',
			cls: 'bi-note-field-hint',
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

		const actionsWrap = row.createDiv('bi-note-settings-source-actions');

		const moveUpBtn = actionsWrap.createEl('button', {
			text: '↑',
			cls: 'bi-note-btn bi-note-btn-icon',
		});
		moveUpBtn.disabled = sourceIndex === 0;
		moveUpBtn.addEventListener('click', () => {
			void this.moveSource(config, sourceIndex, -1);
		});

		const moveDownBtn = actionsWrap.createEl('button', {
			text: '↓',
			cls: 'bi-note-btn bi-note-btn-icon',
		});
		moveDownBtn.disabled = sourceIndex === config.sources.length - 1;
		moveDownBtn.addEventListener('click', () => {
			void this.moveSource(config, sourceIndex, 1);
		});

		// Delete button
		const deleteBtn = actionsWrap.createEl('button', {
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
