import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, UrlTree } from '@angular/router';

@Component({
	selector: 'cuentoneta-card',
	imports: [CommonModule, RouterLink],
	template: `<article
		class="card flex flex-col gap-2 border-1 border-solid border-primary-300 p-5 shadow-lg hover:shadow-lg-hover md:gap-4 md:p-8"
	>
		<a [routerLink]="route()" class="flex flex-col gap-2 md:gap-4">
			<ng-content select="[slot=header]" />
			<ng-content select="[slot=content]" />
		</a>
		<ng-content select="[slot=footer]" />
	</article>`,
	styles: ``,
})
export class CardComponent {
	private router = inject(Router);
	readonly route = input<UrlTree>(this.router.createUrlTree([]));
}
