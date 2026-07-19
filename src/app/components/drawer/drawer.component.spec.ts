import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';

import { DrawerComponent, DrawerDirection } from './drawer.component';
import { DrawerHeaderDirective } from './drawer-header.directive';
import { DrawerFooterDirective } from './drawer-footer.directive';

@Component({
	imports: [DrawerComponent, DrawerHeaderDirective, DrawerFooterDirective],
	template: `
		<button (click)="drawer.open()" type="button">Abrir</button>
		<cuentoneta-drawer
			(opened)="openedCount = openedCount + 1"
			(closed)="closedCount = closedCount + 1"
			(afterClosed)="afterClosedCount = afterClosedCount + 1"
			[direction]="direction"
			[title]="title"
			[description]="description"
			[closeOnBackdrop]="closeOnBackdrop"
			[closeOnEscape]="closeOnEscape"
			#drawer
		>
			@if (withHeaderSlot) {
				<ng-template cuentonetaDrawerHeader><span>Encabezado propio</span></ng-template>
			}
			@if (withFooterSlot) {
				<ng-template cuentonetaDrawerFooter><span>Pie propio</span></ng-template>
			}
			<p>Contenido del drawer</p>
		</cuentoneta-drawer>
	`,
})
class HostComponent {
	public direction: DrawerDirection = 'right';
	public title = '';
	public description = '';
	public closeOnBackdrop = true;
	public closeOnEscape = true;
	public withHeaderSlot = false;
	public withFooterSlot = false;
	public openedCount = 0;
	public closedCount = 0;
	public afterClosedCount = 0;
}

const getDialog = (): HTMLDialogElement => screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;
const openDrawer = (): void => {
	fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
};

describe('DrawerComponent', () => {
	it('should project its content', async () => {
		await render(HostComponent);
		expect(screen.getByText('Contenido del drawer')).toBeInTheDocument();
	});

	it('should open the native dialog and emit opened', async () => {
		const { fixture } = await render(HostComponent);
		openDrawer();
		expect(getDialog().open).toBe(true);
		expect(fixture.componentInstance.openedCount).toBe(1);
	});

	it('should not open twice while already open', async () => {
		const { fixture } = await render(HostComponent);
		openDrawer();
		openDrawer();
		expect(fixture.componentInstance.openedCount).toBe(1);
	});

	it('should close via the X button: emit closed immediately and afterClosed on transitionend', async () => {
		const { fixture } = await render(HostComponent);
		openDrawer();
		const dialog = getDialog();

		fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
		expect(fixture.componentInstance.closedCount).toBe(1);
		expect(dialog.open).toBe(true); // aún abierto hasta que termina la transición

		fireEvent(dialog, new Event('transitionend'));
		expect(dialog.open).toBe(false);
		expect(fixture.componentInstance.afterClosedCount).toBe(1);
	});

	it('should close on backdrop click but not on content click', async () => {
		const { fixture } = await render(HostComponent);
		openDrawer();
		const dialog = getDialog();

		fireEvent.click(screen.getByText('Contenido del drawer'));
		expect(fixture.componentInstance.closedCount).toBe(0);

		fireEvent.click(dialog);
		expect(fixture.componentInstance.closedCount).toBe(1);
	});

	it('should not close on backdrop click when closeOnBackdrop is false', async () => {
		const { fixture } = await render(HostComponent, { componentProperties: { closeOnBackdrop: false } });
		openDrawer();
		fireEvent.click(getDialog());
		expect(fixture.componentInstance.closedCount).toBe(0);
	});

	it('should close on Escape (cancel) when closeOnEscape is true', async () => {
		const { fixture } = await render(HostComponent);
		openDrawer();
		fireEvent(getDialog(), new Event('cancel', { cancelable: true }));
		expect(fixture.componentInstance.closedCount).toBe(1);
	});

	it('should prevent the native Escape close without closing when closeOnEscape is false', async () => {
		const { fixture } = await render(HostComponent, { componentProperties: { closeOnEscape: false } });
		openDrawer();
		const event = new Event('cancel', { cancelable: true });
		fireEvent(getDialog(), event);
		expect(event.defaultPrevented).toBe(true);
		expect(fixture.componentInstance.closedCount).toBe(0);
	});

	it('should wire aria-labelledby/aria-describedby from title and description', async () => {
		await render(HostComponent, { componentProperties: { title: 'Título', description: 'Descripción' } });
		const dialog = getDialog();
		expect(dialog.getAttribute('aria-labelledby')).toBe(
			screen.getByRole('heading', { name: 'Título', hidden: true }).id,
		);
		expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText('Descripción').id);
	});

	it('should render header and footer slots when provided', async () => {
		await render(HostComponent, { componentProperties: { withHeaderSlot: true, withFooterSlot: true } });
		expect(screen.getByText('Encabezado propio')).toBeInTheDocument();
		expect(screen.getByText('Pie propio')).toBeInTheDocument();
	});

	it('should apply the direction class to the dialog', async () => {
		await render(HostComponent, { componentProperties: { direction: 'left' } });
		expect(getDialog()).toHaveClass('drawer-left');
	});
});
