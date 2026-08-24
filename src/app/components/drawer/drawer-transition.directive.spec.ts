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

		// El frame diferido quedó cancelado: correrlo no reabre el panel, y el cierre no deja
		// ningún listener de `transitionend` colgado que dispare una segunda finalización.
		runOnlyPendingTimers();
		dialog.dispatchEvent(new Event('transitionend'));
		expect(dialog.open).toBe(false);
		expect(directive.isTransitionedIn()).toBe(false);
		expect(onComplete).toHaveBeenCalledTimes(1);
	});
});
