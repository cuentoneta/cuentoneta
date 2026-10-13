import { ApplicationRef, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

// Caracteriza el contrato de Angular del que dependen las páginas: el SSR serializa con la app estable,
// y un `rxResource` la mantiene inestable mientras carga, sin wrapper y aunque el stream no sea HTTP.
// Si una versión de Angular lo cambia, las páginas volverían a servir el skeleton al crawler.
describe('rxResource y la estabilidad de la app', () => {
	function stability(): () => boolean {
		let stable = false;
		TestBed.inject(ApplicationRef).isStable.subscribe((value) => (stable = value));
		return () => stable;
	}

	function resourceOver(source: Subject<string>, params = signal('a')) {
		return TestBed.runInInjectionContext(() =>
			rxResource({ params, stream: () => source.asObservable(), defaultValue: '' }),
		);
	}

	it('no está estable mientras el recurso carga, y se estabiliza con el primer valor', async () => {
		const source = new Subject<string>();
		const isStable = stability();
		const resource = resourceOver(source);
		TestBed.tick();

		expect(isStable()).toBe(false);

		source.next('valor');
		await TestBed.inject(ApplicationRef).whenStable();

		expect(resource.value()).toBe('valor');
		expect(isStable()).toBe(true);
	});

	it('se estabiliza también cuando el stream falla', async () => {
		const source = new Subject<string>();
		const resource = resourceOver(source);
		TestBed.tick();

		source.error(new Error('backend caído'));
		await TestBed.inject(ApplicationRef).whenStable();

		expect(resource.status()).toBe('error');
	});

	it('vuelve a quedar inestable cuando cambian los params de un recurso ya resuelto', async () => {
		const first = new Subject<string>();
		const params = signal('a');
		const isStable = stability();
		resourceOver(first, params);
		TestBed.tick();
		first.next('a');
		await TestBed.inject(ApplicationRef).whenStable();

		params.set('b');
		TestBed.tick();

		expect(isStable()).toBe(false);
	});
});
