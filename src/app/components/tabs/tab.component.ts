import { ChangeDetectionStrategy, Component, input, TemplateRef, viewChild } from '@angular/core';

@Component({
	selector: 'cuentoneta-tab',
	imports: [],
	template: ` <ng-template>
		<ng-content />
	</ng-template>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Tab {
	public readonly title = input.required<string>();
	public readonly name = input.required<string>();
	public readonly content = viewChild.required(TemplateRef);
}
