import { Directive, inject, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { MacroTaskWrapperService } from '../providers/macro-task-wrapper.service';

/**
 * @description
 * Esta directiva se usa para traer contenido de una fuente y mostrar un indicador
 * de carga, mediante la propiedad isLoading, mientras se está realizando
 * la llamada async a la fuente.
 * @example
 * // Path: src\app\pages\home\home.component.ts
 * // Path: src\app\pages\storylist\storylist.component.ts
 *
 */

@Directive({
	selector: '[cuentonetaFetchContent]',
	standalone: true,
})
export class FetchContentDirective {
	// Providers
	private platformId = inject(PLATFORM_ID);
	private macroTaskWrapperService = inject(MacroTaskWrapperService);

	isLoading: boolean = false;

	/**
	 * @description
	 * Dado un observable de tipo T, se actualiza la propiedad isLoading
	 * al realizar la llamada async a la fuente y luego de terminada ésta.
	 * @param source$
	 */
	public fetchContent$<T>(source$: Observable<T>): Observable<T> {
		this.isLoading = true;
		return (
			isPlatformBrowser(this.platformId)
				? source$
				: this.macroTaskWrapperService.wrapMacroTaskObservable<T>(
						'StorylistNavigationFrameComponent.fetchData',
						source$,
						null,
						'first-emit',
					)
		).pipe(tap(() => (this.isLoading = false)));
	}
}
