import { DestroyRef, inject, PLATFORM_ID, signal, type Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Adhiere listeners al target sólo en el navegador (en SSR la signal conserva `initial`) y los
// limpia al destruirse el contexto de inyección. Debe llamarse dentro de un contexto de inyección
// (p. ej. field initializer de un @Injectable). `signal.set` deduplica valores iguales, de modo
// que cada evento sólo actualiza la signal cuando el valor projectado cambia.
export function fromEventSignal<T>(
	target: EventTarget,
	events: string | string[],
	project: () => T,
	initial: T,
): Signal<T> {
	const value = signal(initial);
	const names = typeof events === 'string' ? [events] : events;
	const handler = (): void => {
		value.set(project());
	};
	const destroyRef = inject(DestroyRef);

	if (isPlatformBrowser(inject(PLATFORM_ID))) {
		for (const name of names) {
			target.addEventListener(name, handler, { passive: true });
		}
		destroyRef.onDestroy(() => {
			for (const name of names) {
				target.removeEventListener(name, handler);
			}
		});
	}

	return value.asReadonly();
}
