import { Plugin } from 'obsidian';
import type { BiNoteSettings, CalendarViewConfig } from './types';
import { DEFAULT_SETTINGS, BiNoteSettingTab } from './settings';
import { CALENDAR_VIEW_TYPE, CalendarView } from './views/CalendarView';
import {
	DEFAULT_DAY_CELL_MIN_HEIGHT,
	DEFAULT_SOURCE_INDICATOR_HEIGHT,
	normalizeDayCellMinHeight,
	normalizeSourceIndicatorHeight,
} from './types';

export default class BiNotePlugin extends Plugin {
	settings: BiNoteSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(
			CALENDAR_VIEW_TYPE,
			(leaf) => new CalendarView(leaf, this),
		);

		this.addSettingTab(new BiNoteSettingTab(this.app, this));
		this.registerVaultRefreshEvents();

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

	private registerVaultRefreshEvents(): void {
		this.registerEvent(
			this.app.vault.on('create', () => {
				this.refreshAllCalendarViews();
			}),
		);
		this.registerEvent(
			this.app.vault.on('delete', () => {
				this.refreshAllCalendarViews();
			}),
		);
		this.registerEvent(
			this.app.vault.on('rename', () => {
				this.refreshAllCalendarViews();
			}),
		);
	}

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
		const migratedHeights = getMigratedGlobalHeights(saved?.calendarViews);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, migratedHeights, saved, {
			globalSourceIndicatorHeight: normalizeSourceIndicatorHeight(
				saved?.globalSourceIndicatorHeight ?? migratedHeights.globalSourceIndicatorHeight,
			),
			globalDayCellMinHeight: normalizeDayCellMinHeight(
				saved?.globalDayCellMinHeight ?? migratedHeights.globalDayCellMinHeight,
			),
		});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.refreshAllCalendarViews();
	}

	refreshAllCalendarViews(): void {
		for (const leaf of this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)) {
			if (leaf.view instanceof CalendarView) {
				leaf.view.refresh();
			}
		}
	}
}

function getMigratedGlobalHeights(
	calendarViews: CalendarViewConfig[] | undefined,
): Pick<BiNoteSettings, 'globalSourceIndicatorHeight' | 'globalDayCellMinHeight'> {
	const firstSourceIndicatorHeight = calendarViews?.find(
		(view) => typeof view.sourceIndicatorHeight === 'number',
	)?.sourceIndicatorHeight;
	const firstDayCellMinHeight = calendarViews?.find(
		(view) => typeof view.dayCellMinHeight === 'number',
	)?.dayCellMinHeight;

	return {
		globalSourceIndicatorHeight: normalizeSourceIndicatorHeight(
			firstSourceIndicatorHeight ?? DEFAULT_SOURCE_INDICATOR_HEIGHT,
		),
		globalDayCellMinHeight: normalizeDayCellMinHeight(
			firstDayCellMinHeight ?? DEFAULT_DAY_CELL_MIN_HEIGHT,
		),
	};
}
