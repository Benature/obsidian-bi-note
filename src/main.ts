import { Plugin } from 'obsidian';
import type { BiNoteSettings } from './types';
import { DEFAULT_SETTINGS, BiNoteSettingTab } from './settings';
import { CALENDAR_VIEW_TYPE, CalendarView } from './views/CalendarView';

export default class BiNotePlugin extends Plugin {
	settings: BiNoteSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(
			CALENDAR_VIEW_TYPE,
			(leaf) => new CalendarView(leaf, this),
		);

		this.addSettingTab(new BiNoteSettingTab(this.app, this));

		this.registerCalendarCommands();

		// eslint-disable-next-line obsidianmd/ui/sentence-case
		this.addRibbonIcon('calendar', 'Bi-Note calendar', () => {
			const first = this.settings.calendarViews[0];
			if (first) {
				void this.openCalendarView(first.id);
			}
		});
	}

	onunload(): void {}

	private registerCalendarCommands(): void {
		for (const config of this.settings.calendarViews) {
			this.addCommand({
				id: `open-calendar-${config.id}`,
				name: `Open calendar: ${config.name}`,
				callback: () => {
					void this.openCalendarView(config.id);
				},
			});
		}
	}

	async openCalendarView(configId: string, newLeaf = false): Promise<void> {
		const leaf = this.app.workspace.getLeaf(newLeaf);
		await leaf.setViewState({
			type: CALENDAR_VIEW_TYPE,
			state: { configId },
		});
		void this.app.workspace.revealLeaf(leaf);
	}

	async loadSettings(): Promise<void> {
		const saved = (await this.loadData()) as Partial<BiNoteSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		for (const leaf of this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)) {
			if (leaf.view instanceof CalendarView) {
				leaf.view.refresh();
			}
		}
	}
}
