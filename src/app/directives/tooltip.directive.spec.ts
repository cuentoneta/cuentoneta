import { Component, inject, OnInit } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { TooltipDirective } from './tooltip.directive';
import userEvent from '@testing-library/user-event';

const ELEMENT_WIDTH = 500;
const ELEMENT_HEIGHT = 500;

@Component({
	template: `
		<div [style.width.px]="width" [style.height.px]="height" [>
			<p>Host component</p>
		</div>
	`,
	standalone: true,
	imports: [TooltipDirective],
	hostDirectives: [TooltipDirective],
})
class HostComponent implements OnInit {
	width = ELEMENT_WIDTH;
	height = ELEMENT_HEIGHT;
	private tooltipDirective = inject(TooltipDirective);

	ngOnInit() {
		this.tooltipDirective.text.set('Tooltip test');
		this.tooltipDirective.position.set('bottom');
	}
}

describe('TooltipDirective', () => {
	test('Should render a tooltip when the mouse enter the Host component', async () => {
		await render(HostComponent);

		const hostComponent = screen.getByText(/Host component/);

		await userEvent.hover(hostComponent);

		expect(screen.getByText('Tooltip test')).toBeInTheDocument();

		await userEvent.unhover(hostComponent);
		expect(screen.queryByText('Tooltip test')).not.toBeInTheDocument();
	});
});
