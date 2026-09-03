import { fn, runOnlyPendingTimers, useFakeTimers, useRealTimers } from '@test-utils';

import { DrawerTransitionDirective } from './drawer-transition.directive';

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

describe('DrawerTransitionDirective', () => {
	let directive: DrawerTransitionDirective;
	let dialog: HTMLDialogElement;

	beforeEach(() => {
		directive = new DrawerTransitionDirective();
		dialog = document.createElement('dialog');
		document.body.appendChild(dialog);
	});

	afterEach(() => {
		useRealTimers();
		dialog.remove();
	});

	it('should open the dialog and flag the transition on the next frame', async () => {
		directive.open(dialog);
		expect(dialog.open).toBe(true);
		expect(directive.isTransitionedIn()).toBe(false);

		await nextFrame();
		expect(directive.isTransitionedIn()).toBe(true);
	});

	it('should close the dialog only after transitionend fires', async () => {
		directive.open(dialog);
		await nextFrame();

		let completed = false;
		directive.close(dialog, () => (completed = true));
		expect(directive.isTransitionedIn()).toBe(false);
		expect(dialog.open).toBe(true);

		// happy-dom no ejecuta transiciones CSS reales: se despacha `transitionend` a mano.
		dialog.dispatchEvent(new Event('transitionend'));
		expect(dialog.open).toBe(false);
		expect(completed).toBe(true);
	});

	it('should close synchronously when close arrives before the entry frame runs', () => {
		useFakeTimers();

		const onComplete = fn();
		directive.open(dialog);
		directive.close(dialog, onComplete);

		expect(dialog.open).toBe(false);
		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(directive.isTransitionedIn()).toBe(false);

		// El frame cancelado no reabre ni completa de más.
		runOnlyPendingTimers();
		dialog.dispatchEvent(new Event('transitionend'));
		expect(dialog.open).toBe(false);
		expect(directive.isTransitionedIn()).toBe(false);
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('should complete a late close immediately without leaving transition listeners behind', () => {
		useFakeTimers();

		const firstComplete = fn();
		const secondComplete = fn();
		directive.open(dialog);
		directive.close(dialog, firstComplete);
		expect(dialog.open).toBe(false);

		// Sobre diálogo cerrado no se apilan listeners.
		directive.close(dialog, secondComplete);
		expect(secondComplete).toHaveBeenCalledTimes(1);

		dialog.dispatchEvent(new Event('transitionend'));
		expect(firstComplete).toHaveBeenCalledTimes(1);
		expect(secondComplete).toHaveBeenCalledTimes(1);
	});

	it('should reopen normally after a close that landed before the entry frame ran', () => {
		useFakeTimers();

		const firstComplete = fn();
		directive.open(dialog);
		directive.close(dialog, firstComplete);
		directive.open(dialog);

		expect(dialog.open).toBe(true);
		expect(directive.isTransitionedIn()).toBe(false);

		runOnlyPendingTimers();
		expect(directive.isTransitionedIn()).toBe(true);

		let completed = false;
		directive.close(dialog, () => (completed = true));
		dialog.dispatchEvent(new Event('transitionend'));
		expect(dialog.open).toBe(false);
		expect(completed).toBe(true);
		expect(firstComplete).toHaveBeenCalledTimes(1);
	});
});
