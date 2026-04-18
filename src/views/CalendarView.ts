import {
	App,
	ItemView,
	Modal,
	Notice,
	Setting,
	TFile,
	ViewStateResult,
	WorkspaceLeaf,
} from 'obsidian';
import type BiNotePlugin from '../main';
import type { CalendarViewConfig } from '../types';
import { getFilePath, isSameDay } from '../utils/dateUtils';

export const CALENDAR_VIEW_TYPE = 'bi-note-calendar';

export class CalendarView extends ItemView {
	private plugin: BiNotePlugin;
	private configId = '';
	private currentYear: number;
	private currentMonth: number;

	constructor(leaf: WorkspaceLeaf, plugin: BiNotePlugin) {
		super(leaf);
		this.plugin = plugin;
		const now = new Date();
		this.currentYear = now.getFullYear();
		this.currentMonth = now.getMonth();
	}

	getViewType(): string {
		return CALENDAR_VIEW_TYPE;
	}

	getDisplayText(): string {
		const config = this.getConfig();
		return config ? config.name : 'Calendar';
	}

	getIcon(): string {
		return 'calendar';
	}

	async setState(state: unknown, result: ViewStateResult): Promise<void> {
		if (
			state !== null &&
			typeof state === 'object' &&
			'configId' in state &&
			typeof (state as Record<string, unknown>)['configId'] === 'string'
		) {
			this.configId = (state as Record<string, unknown>)['configId'] as string;
		}
		await super.setState(state, result);
		this.render();
	}

	getState(): Record<string, unknown> {
		const parentState = super.getState();
		return { ...parentState, configId: this.configId };
	}

	private getConfig(): CalendarViewConfig | undefined {
		return this.plugin.settings.calendarViews.find(v => v.id === this.configId);
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {}

	public refresh(): void {
		this.render();
	}

	private render(): void {
		const container = this.contentEl;
		container.empty();
		container.addClass('bi-note-calendar-container');

		const config = this.getConfig();
		if (!config) {
			container.createEl('div', {
				cls: 'bi-note-empty-state',
				text: '未找到日历配置，请在插件设置中检查。',
			});
			return;
		}

		this.renderCalendar(container, config);
	}

	private renderCalendar(container: HTMLElement, config: CalendarViewConfig): void {
		const today = new Date();

		// ── Header ────────────────────────────────────────────────────────────
		const header = container.createDiv('bi-note-calendar-header');

		const leftControls = header.createDiv('bi-note-header-left');
		const prevBtn = leftControls.createEl('button', { cls: 'bi-note-nav-btn', text: '‹' });
		const nextBtn = leftControls.createEl('button', { cls: 'bi-note-nav-btn', text: '›' });

		header.createEl('span', {
			cls: 'bi-note-month-title',
			text: new Date(this.currentYear, this.currentMonth, 1).toLocaleString('default', {
				month: 'long',
				year: 'numeric',
			}),
		});

		const rightControls = header.createDiv('bi-note-header-right');
		const todayBtn = rightControls.createEl('button', {
			cls: 'bi-note-today-btn',
			text: 'Today',
		});

		prevBtn.addEventListener('click', () => {
			if (this.currentMonth === 0) {
				this.currentMonth = 11;
				this.currentYear--;
			} else {
				this.currentMonth--;
			}
			this.render();
		});

		nextBtn.addEventListener('click', () => {
			if (this.currentMonth === 11) {
				this.currentMonth = 0;
				this.currentYear++;
			} else {
				this.currentMonth++;
			}
			this.render();
		});

		todayBtn.addEventListener('click', () => {
			const now = new Date();
			this.currentYear = now.getFullYear();
			this.currentMonth = now.getMonth();
			this.render();
		});

		// ── Legend ────────────────────────────────────────────────────────────
		if (config.sources.length > 0) {
			const legend = container.createDiv('bi-note-legend');
			for (const source of config.sources) {
				const item = legend.createDiv('bi-note-legend-item');
				const dot = item.createDiv('bi-note-legend-dot');
				dot.style.backgroundColor = source.color;
				item.createSpan({ text: source.name });
			}
		}

		// ── Calendar grid ─────────────────────────────────────────────────────
		const grid = container.createDiv('bi-note-calendar-grid');

		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		for (const name of dayNames) {
			grid.createDiv({ text: name, cls: 'bi-note-day-header' });
		}

		const firstDay = new Date(this.currentYear, this.currentMonth, 1);
		const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

		// Leading empty cells
		for (let i = 0; i < firstDay.getDay(); i++) {
			grid.createDiv('bi-note-day-cell bi-note-day-empty');
		}

		// Day cells
		for (let d = 1; d <= daysInMonth; d++) {
			const date = new Date(this.currentYear, this.currentMonth, d);
			const isToday = isSameDay(date, today);

			const cell = grid.createDiv(
				'bi-note-day-cell' + (isToday ? ' bi-note-today' : ''),
			);
			cell.createDiv({ text: String(d), cls: 'bi-note-day-number' });

			if (config.sources.length > 0) {
				const sourcesRow = cell.createDiv('bi-note-day-sources');
				for (const source of config.sources) {
					const filePath = getFilePath(source.pathTemplate, date);
					const file = this.app.vault.getAbstractFileByPath(filePath);
					const exists = file instanceof TFile;

					const indicator = sourcesRow.createDiv({
						cls: `bi-note-source-indicator ${exists ? 'exists' : 'missing'}`,
					});
					if (exists) {
						indicator.style.backgroundColor = source.color;
					}
					indicator.title = `${source.name}${exists ? '' : '（未创建）'}`;

					indicator.addEventListener('click', (e: MouseEvent) => {
						e.stopPropagation();
						void this.openOrCreateNote(filePath);
					});
				}
			}
		}
	}

	private async openOrCreateNote(filePath: string): Promise<void> {
		let file = this.app.vault.getAbstractFileByPath(filePath);

		if (!(file instanceof TFile)) {
			if (this.plugin.settings.confirmBeforeCreate) {
				const shouldCreate = await confirmCreateNote(this.app, filePath);
				if (!shouldCreate) {
					return;
				}
			}

			const dir = filePath.substring(0, filePath.lastIndexOf('/'));
			if (dir) {
				await ensureFolder(this.app, dir);
			}
			try {
				file = await this.app.vault.create(filePath, '');
				// Refresh so the new note is reflected
				this.render();
			} catch {
				new Notice(`创建笔记失败：${filePath}`);
				return;
			}
		}

		if (file instanceof TFile) {
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
		}
	}
}

class ConfirmCreateNoteModal extends Modal {
	private readonly filePath: string;
	private readonly onSubmit: (confirmed: boolean) => void;

	constructor(app: App, filePath: string, onSubmit: (confirmed: boolean) => void) {
		super(app);
		this.filePath = filePath;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h3', { text: '创建笔记？' });
		contentEl.createEl('p', {
			text: `目标文件不存在，是否创建并打开？`,
		});
		contentEl.createEl('code', {
			text: this.filePath,
		});

		new Setting(contentEl)
			.addButton((button) => {
				button.setButtonText('取消').onClick(() => {
					this.onSubmit(false);
					this.close();
				});
			})
			.addButton((button) => {
				button.setButtonText('创建').setCta().onClick(() => {
					this.onSubmit(true);
					this.close();
				});
			});
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

function confirmCreateNote(app: App, filePath: string): Promise<boolean> {
	return new Promise((resolve) => {
		let resolved = false;
		const modal = new ConfirmCreateNoteModal(app, filePath, (confirmed) => {
			resolved = true;
			resolve(confirmed);
		});

		modal.onClose = () => {
			modal.contentEl.empty();
			if (!resolved) {
				resolve(false);
			}
		};

		modal.open();
	});
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
	if (!folderPath) return;
	const parts = folderPath.split('/');
	let current = '';
	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		if (!app.vault.getAbstractFileByPath(current)) {
			try {
				await app.vault.createFolder(current);
			} catch {
				// folder may already exist (race condition)
			}
		}
	}
}
