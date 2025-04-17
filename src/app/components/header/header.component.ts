import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InternalLink } from '@models/link.model';

@Component({
	selector: '[cuentoneta-header]',
	template: `
		<div class="w-100 container max-w-screen-lg">
			<section class="logo flex items-center">
				<a [routerLink]="['/', 'home']" class="flex">
					<img [ngSrc]="'./assets/svg/logo.svg'" class="mr-3" width="59" height="32" alt="Logo de 'La Cuentoneta'" />
					<h1 class="inter-body-lg-bold flex items-center">La Cuentoneta</h1>
				</a>
			</section>

			<nav class="navigation flex items-center justify-end">
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

			@if (displayMenu) {
				<nav class="mb-8 block grid-cols-2 grid-rows-2 md:hidden">
					<ul>
						@for (navLink of navLinks; track $index) {
							<li
								class="inter-body-lg-semibold flex h-12 items-center border-b-2 border-gray-200 hover:text-interactive-500"
							>
								<a
									[routerLink]="navLink.path"
									[tabindex]="navLink.label === 'Inicio' ? -1 : 0"
									[attr.aria-hidden]="navLink.label === 'Inicio'"
									>{{ navLink.label }}</a
								>
							</li>
						}
					</ul>
				</nav>
			}
		</div>
	`,
	styles: `
		:host {
			@apply fixed top-0 z-10 flex w-full items-center justify-center;
			@apply px-5 md:m-auto;
			@apply min-h-20;
			@apply bg-gray-50;

			transition: top 0.2s ease-in-out;

			.container {
				@apply grid h-full;

				/*Layout de grid para vistas md y superiores */
				@apply grid-cols-[1fr_theme(spacing.6)] grid-rows-[theme(spacing.20)_1fr];

				/*Layout de grid para vistas sm y menores */
				@apply md:grid-cols-2 md:grid-rows-1;
			}
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
