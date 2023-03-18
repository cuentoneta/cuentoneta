import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
    selector: '[cuentonetaDestroyed]',
    standalone: true,
})
export class DestroyedDirective implements OnDestroy {
    destroyed$ = new Subject<void>();

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
