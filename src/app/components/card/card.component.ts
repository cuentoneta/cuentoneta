import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, UrlTree } from '@angular/router';

@Component({
	selector: 'cuentoneta-card',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `<article class="card border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:p-8">
		<a [routerLink]="route()" class="flex flex-col gap-2 md:gap-4">
			<ng-content select="[slot=header]"></ng-content>
			<ng-content select="[slot=content]"></ng-content>
			<ng-content select="[slot=footer]"></ng-content>
			<ng-content></ng-content>
		</a>
	</article>`,
	styles: ``,
})
export class CardComponent {
	private router = inject(Router);
	route = input<UrlTree>(this.router.createUrlTree([]));
}
