import { Directive } from '@angular/core';
import { Observable, OperatorFunction, tap } from 'rxjs';
import { Params } from '@angular/router';

@Directive({
    selector: '[cuentonetaFetchContent]',
    standalone: true,
})
export class FetchContentDirective<T> {
    isLoading: boolean = false;

    public fetchContent(params$: Observable<Params>, operatorFunction$: OperatorFunction<Params, T>): Observable<T> {
        return params$.pipe(
            tap(() => (this.isLoading = true)),
            operatorFunction$,
            tap(() => (this.isLoading = false))
        );
    }
}
