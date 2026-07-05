import { ApplicationRef } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { NEVER, Subject } from 'rxjs';

import { progressiveRxResource, ssrBlockingRxResource } from './ssr-resource';

// Deja correr las tasks pendientes (scheduler zoneless + resolución de `whenStable`) sin fake timers.
const flushTasks = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('ssrBlockingRxResource', () => {
	it('mantiene la app inestable (whenStable no resuelve) hasta el primer emit del stream', async () => {
		const emitter = new Subject<string>();
		const resource = TestBed.runInInjectionContext(() =>
			ssrBlockingRxResource({ stream: () => emitter.asObservable(), defaultValue: undefined }),
		);
		const appRef = TestBed.inject(ApplicationRef);

		// Corre el effect de carga del resource: se suscribe al stream y `pendingUntilEvent` registra la PendingTask.
		TestBed.tick();

		let stable = false;
		appRef.whenStable().then(() => (stable = true));
		await flushTasks();
		expect(stable).toBe(false);
		expect(resource.isLoading()).toBe(true);

		emitter.next('el-aleph');
		emitter.complete();
		await appRef.whenStable();
		TestBed.tick();

		expect(stable).toBe(true);
		expect(resource.value()).toBe('el-aleph');
	});

	it('no deja PendingTasks colgadas tras el emit (whenStable vuelve a resolver)', async () => {
		const emitter = new Subject<string>();
		TestBed.runInInjectionContext(() =>
			ssrBlockingRxResource({ stream: () => emitter.asObservable(), defaultValue: '' }),
		);
		const appRef = TestBed.inject(ApplicationRef);
		TestBed.tick();

		emitter.next('primero');
		emitter.next('segundo');
		emitter.complete();

		// Si `pendingUntilEvent` no limpiara su task al primer emit, esto quedaría pendiente para siempre.
		await appRef.whenStable();
		expect(true).toBe(true);
	});

	it('respeta el overload sin defaultValue (valor inicial undefined)', () => {
		const resource = TestBed.runInInjectionContext(() => ssrBlockingRxResource({ stream: () => NEVER }));
		expect(resource.value()).toBeUndefined();
	});
});

describe('progressiveRxResource', () => {
	// Es `rxResource` por identidad: no agrega ningún comportamiento (ni bloqueo de SSR) que testear
	// aparte del que ya cubre Angular. Contrasta con `ssrBlockingRxResource`, que sí bloquea `whenStable`.
	it('es un alias directo de rxResource', () => {
		expect(progressiveRxResource).toBe(rxResource);
	});
});
