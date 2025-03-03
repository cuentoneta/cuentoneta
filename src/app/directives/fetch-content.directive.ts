import { Directive } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { pendingUntilEvent } from '@angular/core/rxjs-interop';

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
	isLoading: boolean = false;

	/**
	 * @description
	 * Dado un observable de tipo T, se actualiza la propiedad isLoading
	 * al realizar la llamada async a la fuente y luego de terminada ésta.
	 * @param source$
	 */
	public fetchContent$<T>(source$: Observable<T>): Observable<T> {
		this.isLoading = true;
		return source$.pipe(
			pendingUntilEvent(),
			tap(() => (this.isLoading = false)),
		);
	}
}
