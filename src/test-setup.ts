import '@analogjs/vitest-angular/setup-snapshots';
import '@testing-library/jest-dom/vitest';

import { ErrorHandler, NgModule } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import { installDocumentFontsStub } from '@testing/document-fonts.stub';
import { installIntersectionObserverStub } from '@testing/intersection-observer.stub';
import { installResizeObserverStub } from '@testing/resize-observer.stub';

// Angular 22 corre el TestBed en modo zoneless por defecto cuando zone.js no está presente,
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

// happy-dom trae los observers de layout como constructores que no hacen nada —alcanzan para renderizar,
// pero nunca entregan un callback— y no expone `document.fonts`. Estos stubs globales dan el control que
// falta: los specs que necesitan simular overflow o resolver la carga de fuentes usan sus helpers.
installIntersectionObserverStub();
installResizeObserverStub();
installDocumentFontsStub();
