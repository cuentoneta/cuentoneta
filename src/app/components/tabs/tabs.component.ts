import { ChangeDetectionStrategy, Component, contentChildren, input, linkedSignal } from '@angular/core';
import Tab from './tab.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
	selector: 'cuentoneta-tabs',
	imports: [NgTemplateOutlet],
	template: `<div role="tablist" class="inline-flex h-12 items-start gap-4 border-b-2 border-neutral-200">
			@for (tab of tabs(); track $index) {
				@let tabTitle = tab.title();
				@let activeTabTitle = active().title();
				<button
					(click)="setActive(tab)"
					[attr.aria-selected]="tabTitle === activeTabTitle"
					[attr.aria-controls]="'tabpanel-' + tab.name()"
					[class]="
						tabTitle === activeTabTitle ? 'border-brand-400 text-brand-500' : 'border-neutral-200 text-neutral-600'
					"
					class="flex h-12 items-center gap-1 border-b-2 py-3 font-inter font-semibold"
					role="tab"
				>
					{{ tab.title() }}
				</button>
			}
		</div>
		<!-- Todos los paneles se renderizan en el DOM (el inactivo se oculta con [hidden]): así el contenido
			 del tab no activo — p. ej. la biografía del autor — llega al HTML SSR y es indexable por buscadores. -->
		@for (tab of tabs(); track $index) {
			<div
				[id]="'tabpanel-' + tab.name()"
				[attr.aria-labelledby]="tab.title()"
				[hidden]="tab !== active()"
				role="tabpanel"
			>
				<ng-container [ngTemplateOutlet]="tab.content()" />
			</div>
		}`,
	host: {
		class: 'flex flex-col gap-8',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Tabs {
	public readonly initialTab = input<string>();
	public readonly tabs = contentChildren(Tab);
	protected readonly active = linkedSignal({
		source: this.tabs,
		computation: (tabs) => {
			if (tabs.length === 0) {
				throw new Error('No tabs found');
			}

			const name = this.initialTab();
			if (!name) {
				return tabs[0];
			}

			const found = tabs.find((tab) => tab.name() === name);
			if (!found) {
				console.error(`Tab with name ${name} not found, falling back to first tab`);
				return tabs[0];
			}

			return found;
		},
	});

	protected setActive(tab: Tab) {
		this.active.set(tab);
	}
}
