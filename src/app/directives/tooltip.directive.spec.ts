import { Component, effect, inject, input } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { Tooltip } from './tooltip.directive';
import userEvent from '@testing-library/user-event';

const ELEMENT_WIDTH = 500;
const ELEMENT_HEIGHT = 500;
const DEFAULT_TOOLTIP_TEXT = 'Tooltip test';

@Component({
	template: `
		<div [style.width.px]="width" [style.height.px]="height">
			<p>Host component</p>
		</div>
	`,
	standalone: true,
	imports: [Tooltip],
	hostDirectives: [Tooltip],
})
class HostComponent {
	public readonly text = input(DEFAULT_TOOLTIP_TEXT);
	private readonly width = ELEMENT_WIDTH;
	private readonly height = ELEMENT_HEIGHT;
	private readonly tooltipDirective = inject(Tooltip);

	private readonly syncTooltipText = effect(() => {
		this.tooltipDirective.text.set(this.text());
	});

	constructor() {
		this.tooltipDirective.position.set('bottom');
	}
}

describe('Tooltip', () => {
	test('Should render a tooltip when the mouse enter the Host component', async () => {
		await render(HostComponent);

		const hostComponent = screen.getByText(/Host component/);

		await userEvent.hover(hostComponent);

		expect(screen.getByText(DEFAULT_TOOLTIP_TEXT)).toBeInTheDocument();

		await userEvent.unhover(hostComponent);
		expect(screen.queryByText(DEFAULT_TOOLTIP_TEXT)).not.toBeInTheDocument();
	});

	test('Should render markup in the tooltip text as literal text, not as HTML', async () => {
		await render(HostComponent, { inputs: { text: '<b>bold</b>' } });

		const hostComponent = screen.getByText(/Host component/);

		await userEvent.hover(hostComponent);

		expect(screen.getByText('<b>bold</b>')).toBeInTheDocument();
		expect(screen.queryByRole('strong')).not.toBeInTheDocument();
	});
});
