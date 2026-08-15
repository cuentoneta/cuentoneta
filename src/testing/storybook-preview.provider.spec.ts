import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { provideStorybookPreview } from './storybook-preview.provider';
import { LayoutService } from '../app/providers/layout.interface';

// Afirma sobre el **injector**, no montando un componente: `render` de Angular Testing Library aporta
// la ruta activa por su cuenta, así que un caso que monte un componente pasa con y sin estos
// providers y no verificaría nada. Es la única comprobación automatizable del set que el catálogo da
// a toda story — `storybook:build` compila sin ejecutarlas, así que un provider faltante deja el
// canvas en la pantalla de error y CI pasa en verde.
describe('provideStorybookPreview', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [provideStorybookPreview()] });
	});

	it('resuelve lo que un componente con enlaces necesita para montar', () => {
		expect(TestBed.inject(ActivatedRoute)).toBeTruthy();
		expect(TestBed.inject(Router)).toBeTruthy();
	});

	it('resuelve el servicio de layout, que no tiene factory propia', () => {
		expect(TestBed.inject(LayoutService)).toBeTruthy();
	});
});
