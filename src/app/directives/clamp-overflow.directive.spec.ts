import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';

import { setMeasuredSize, triggerResize } from '@testing/resize-observer.stub';
import { ClampOverflowDirective } from './clamp-overflow.directive';

@Component({
	imports: [ClampOverflowDirective],
	template: `
		<div cuentonetaClampOverflow #clamp="cuentonetaClampOverflow" class="line-clamp-2" data-testid="text">
			Prosa recortada
		</div>
		@if (clamp.isOverflowing()) {
			<button type="button">Leer más</button>
		}
	`,
})
class HostComponent {}

describe('ClampOverflowDirective', () => {
	const setup = async (size?: { scrollHeight: number; clientHeight: number }) => {
		const view = await render(HostComponent);
		if (size) {
			setMeasuredSize(screen.getByTestId('text'), size);
			triggerResize();
			await view.fixture.whenStable();
		}
		return view;
	};

	it('should report no overflow while the host has not been measured', async () => {
		await setup();
		expect(screen.queryByRole('button', { name: 'Leer más' })).not.toBeInTheDocument();
	});

	it('should report overflow when the content is taller than the visible area', async () => {
		await setup({ scrollHeight: 400, clientHeight: 100 });
		expect(screen.getByRole('button', { name: 'Leer más' })).toBeInTheDocument();
	});

	it('should not report overflow when the content fits', async () => {
		await setup({ scrollHeight: 100, clientHeight: 100 });
		expect(screen.queryByRole('button', { name: 'Leer más' })).not.toBeInTheDocument();
	});

	it('should tolerate a sub-pixel difference between content and visible height', async () => {
		await setup({ scrollHeight: 101, clientHeight: 100 });
		expect(screen.queryByRole('button', { name: 'Leer más' })).not.toBeInTheDocument();
	});

	it('should stop reporting overflow when the host grows enough to fit the content', async () => {
		const view = await setup({ scrollHeight: 400, clientHeight: 100 });
		setMeasuredSize(screen.getByTestId('text'), { scrollHeight: 400, clientHeight: 400 });
		triggerResize();
		await view.fixture.whenStable();
		expect(screen.queryByRole('button', { name: 'Leer más' })).not.toBeInTheDocument();
	});
});
