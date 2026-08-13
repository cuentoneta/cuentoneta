import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';

import { provideLayout } from '../app/providers/layout.provider';

/**
 * Lo que el catálogo le da a toda story sin que ella lo declare: dependencias que cualquier
 * componente puede necesitar y cuya ausencia deja el canvas en la pantalla de error, no en un
 * componente a medio pintar.
 *
 * Vive acá y no en `.storybook/` para que un spec pueda montarlo: sin eso, "el preview alcanza"
 * no lo verifica ningún gate — `storybook:build` compila sin ejecutar y la suite no mira el preview.
 */
export function provideStorybookPreview(): EnvironmentProviders {
	return makeEnvironmentProviders([
		// `LayoutService` es un token sin factory: quien lo inyecte no renderiza sin este provider.
		provideLayout(),
		// La navegación inicial va desactivada porque el router arrancaría contra `iframe.html`, que
		// no matchea ninguna ruta, y el canvas emitiría un error de ruteo ajeno al componente. Los
		// `routerLink` resuelven su `href` igual: lo que se apaga es la navegación, no el ruteo.
		provideRouter([], withDisabledInitialNavigation()),
	]);
}
