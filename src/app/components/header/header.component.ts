import { Component, inject } from '@angular/core';
import { Storylist } from '@models/storylist.model';
import { ContentService } from '../../providers/content.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'cuentoneta-header',
	template: `
		<header>
			<section class="logo flex items-center">
				<a routerLink="/home" class="flex">
					<img [ngSrc]="'./assets/svg/logo.svg'" class="mr-3" width="59" height="32" alt="Logo de 'La Cuentoneta'" />
					<h1 class="flex items-center inter-body-lg-bold">La Cuentoneta</h1>
				</a>
			</section>

			<section class="navigation flex items-center justify-end">
				<nav>
					<ul class="flex hidden md:flex">
						@for (navLink of navLinks; track $index) {
							<li class="md:ml-12 inter-body-sm-semibold hover:text-interactive-500">
								<a [routerLink]="navLink.route">{{ navLink.title }}</a>
							</li>
						}
					</ul>
					<div (click)="onMenuTogglerClicked($event)" class="md:hidden">
						<img
							[alt]="'Imagen del menú móvil del sitio'"
							[ngSrc]="'./assets/svg/menu.svg'"
							width="24"
							height="24"
							alt="Ícono de menú de hamburguesa de 'La Cuentoneta'"
						/>
					</div>
				</nav>
			</section>

			@if (displayMenu) {
				<section class="grid-cols-2 grid-rows-2 mb-8 block md:hidden">
					<ul>
						@for (navLink of navLinks; track $index) {
							<li
								class="flex items-center h-12 border-gray-200 border-b-2 inter-body-lg-semibold hover:text-interactive-500"
							>
								<a [routerLink]="navLink.route">{{ navLink.title }}</a>
							</li>
						}
					</ul>
				</section>
			}
		</header>
	`,
	styleUrls: ['./header.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterModule, NgOptimizedImage],
})
export class HeaderComponent {
	readonly navLinks: { title: string; route: string }[] = [
		{ title: 'Inicio', route: '/home' },
		{ title: 'Nosotros', route: '/about' },
	];
	lists: Pick<Storylist, 'title' | 'slug'>[] = [];
	displayMenu: boolean = false;
	constructor() {
		const contentService = inject(ContentService);
		this.lists = contentService.getNavLists();
	}

	onMenuTogglerClicked(event: MouseEvent) {
		this.displayMenu = !this.displayMenu;
	}
}
