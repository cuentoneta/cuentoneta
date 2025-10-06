import { ChangeDetectionStrategy, Component, contentChildren, input, linkedSignal } from '@angular/core';
import Tab from './tab.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-tabs',
	imports: [NgTemplateOutlet],
	template: `<div role="tablist" class="inline-flex h-12 items-start gap-4 border-b-2 border-gray-200">
			@for (tab of tabs(); track $index) {
				@let tabTitle = tab.title();
				@let activeTabTitle = active().title();
				<button
					(click)="setActive(tab)"
					[attr.aria-selected]="tabTitle === activeTabTitle"
					[class]="
						tabTitle === activeTabTitle ? 'border-primary-400 text-primary-500' : 'border-gray-200 text-gray-600'
					"
					class="flex h-12 items-center gap-1 border-b-2 py-3 font-inter font-semibold"
					role="tab"
				>
					{{ tab.title() }}
				</button>
			}
		</div>
		@if (active()) {
			<div [attr.aria-labelledby]="active().title()" role="tabpanel">
				<ng-container [ngTemplateOutlet]="active().content()" />
			</div>
		}`,
	styles: `
		:host {
			@apply flex flex-col gap-4;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Tabs {
	readonly initialTabIndex = input<number>(0);
	readonly tabs = contentChildren(Tab);
	readonly active = linkedSignal({
		source: this.tabs,
		computation: (tabs) => {
			if (tabs.length === 0) {
				throw new Error('No tabs found');
			}

			const index = this.initialTabIndex();
			if (index < 0 || index > tabs.length - 1) {
				throw new Error('Initial tab index is out of bounds');
			}

			return tabs[index];
		},
	});

	setActive(tab: Tab) {
		this.active.set(tab);
	}
}
