import { Directive } from '@angular/core';
import { Observable, OperatorFunction, tap } from 'rxjs';
import { Params } from '@angular/router';

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
export class FetchContentDirective<T> {
	isLoading: boolean = false;

	/**
	 * @description
	 * Desde un observable con parámetros de routing, se utiliza una función operadora de tipo
	 * OperatorFunction<Params, T> para traer contenido de una fuente y mostrar un
	 * indicador de carga a lo largo de la llamada.
	 * @param params$
	 * @param operatorFunction$
	 */
	public fetchContentWithSourceParams$<T>(
		params$: Observable<Params>,
		operatorFunction$: OperatorFunction<Params, T>,
	): Observable<T> {
		return params$.pipe(
			tap(() => (this.isLoading = true)),
			operatorFunction$,
			tap(() => (this.isLoading = false)),
		);
	}

	/**
	 * @description
	 * Dado un observable de tipo T, se actualiza la propiedad isLoading
	 * al realizar la llamada async a la fuente y luego de terminada ésta.
	 * @param source$
	 */
	public fetchContent$<T>(source$: Observable<T>): Observable<T> {
		this.isLoading = true;
		return source$.pipe(tap(() => (this.isLoading = false)));
	}
}
