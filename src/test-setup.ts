import '@analogjs/vitest-angular/setup-snapshots';
import '@testing-library/jest-dom/vitest';

import { ErrorHandler, NgModule } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import { installIntersectionObserverStub } from './app/testing/intersection-observer.stub';

// Angular 21 corre el TestBed en modo zoneless por defecto cuando zone.js no está presente,
// por eso no se provee `provideZonelessChangeDetection()` explícitamente. El ErrorHandler relanza
// para que cualquier error no manejado falle el test (mismo comportamiento que el preset de Jest).
@NgModule({
	providers: [
		{
			provide: ErrorHandler,
			useValue: {
				handleError: (error: unknown): never => {
					throw error;
				},
			},
		},
	],
})
class ZonelessTestModule {}

// Sin opciones explícitas: se conserva la paridad con el setup previo de jest-preset-angular,
// que dejaba `errorOnUnknownElements`/`errorOnUnknownProperties` en el default de Angular (no lanzan).
// Algunos specs sustituyen los imports del componente vía `componentImports` y dependen de ese default.
getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());

// jsdom/happy-dom no implementan IntersectionObserver: se instala un stub global para todos los tests.
// Los specs que necesitan controlar el observer (simular overflow) reutilizan los helpers del mismo stub.
installIntersectionObserverStub();
