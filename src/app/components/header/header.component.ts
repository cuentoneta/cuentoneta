import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InternalLink } from '@models/link.model';

@Component({
	selector: '[cuentoneta-header]',
	template: `
		<section class="mx-6 flex w-full items-center">
			<a [routerLink]="['/', 'home']" class="flex">
				<img [ngSrc]="'./assets/svg/logo.svg'" class="mr-3" width="59" height="32" alt="Logo de 'La Cuentoneta'" />
				<h1 class="inter-body-lg-bold flex items-center">La Cuentoneta</h1>
			</a>

			<nav class="flex flex-grow justify-end">
				<ul class="flex hidden md:flex">
					@for (navLink of navLinks; track $index) {
						<li class="inter-body-sm-semibold hover:text-interactive-500 md:ml-12">
							<a
								[routerLink]="navLink.path"
								[tabindex]="navLink.label === 'Inicio' ? -1 : 0"
								[attr.aria-hidden]="navLink.label === 'Inicio'"
								>{{ navLink.label }}</a
							>
						</li>
					}
				</ul>
				<button (click)="onMenuTogglerClicked()" class="md:hidden">
					<img
						[alt]="'Imagen del menú móvil del sitio'"
						[ngSrc]="'./assets/svg/menu.svg'"
						width="24"
						height="24"
						alt="Ícono de menú de hamburguesa de 'La Cuentoneta'"
					/>
				</button>
			</nav>
		</section>
		@if (displayMenu) {
			<section class="fixed top-16 mb-8 block w-full grid-cols-2 grid-rows-2 bg-white md:hidden">
				<ul>
					@for (navLink of navLinks; track $index) {
						<li
							class="inter-body-lg-semibold flex h-12 items-center border-b-2 border-gray-200 px-5 hover:text-interactive-500"
						>
							<a
								(click)="displayMenu = false"
								[routerLink]="navLink.path"
								[tabindex]="navLink.label === 'Inicio' ? -1 : 0"
								[attr.aria-hidden]="navLink.label === 'Inicio'"
							>
								{{ navLink.label }} -></a
							>
						</li>
					}
				</ul>
			</section>
		}
	`,
	styles: `
		:host {
			@apply flex w-full justify-between;
		}
	`,
	imports: [CommonModule, RouterModule, NgOptimizedImage],
})
export class HeaderComponent {
	readonly navLinks: InternalLink[] = [
		{ label: 'Inicio', path: '/home' },
		{ label: 'Nosotros', path: '/about' },
	];
	displayMenu: boolean = false;

	onMenuTogglerClicked() {
		this.displayMenu = !this.displayMenu;
	}
}
