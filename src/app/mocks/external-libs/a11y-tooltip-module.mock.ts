/* eslint-disable @angular-eslint/directive-selector */
import { Directive, input, NgModule } from '@angular/core';

@Directive({
	selector: '[tooltip]',
	standalone: true,
})
export class MockTooltipDirective {
	readonly tooltip = input<string | null>(null);
	readonly tooltipConfig = input<{ asLabel: boolean } | null>(null);
}

@NgModule({
	imports: [MockTooltipDirective],
	exports: [MockTooltipDirective],
})
export class MockA11yTooltipModule {}
