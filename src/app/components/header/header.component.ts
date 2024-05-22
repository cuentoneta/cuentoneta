import { Component, inject } from '@angular/core';
import { Storylist } from '@models/storylist.model';
import { ContentService } from '../../providers/content.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InternalLink } from '@models/link.model';
import { HideOnScrollDirective } from 'src/app/directives/hide-on-scroll.directive';

@Component({
	selector: 'cuentoneta-header',
	template: `
		<header [classNameWhenHidden]="'nav-hidden'" cuentonetaHideOnScroll>
			>
			<section class="logo flex items-center">
				<a routerLink="/home" class="flex">
					<img [ngSrc]="'./assets/svg/logo.svg'" class="mr-3" width="59" height="32" alt="Logo de 'La Cuentoneta'" />
					<h1 class="inter-body-lg-bold flex items-center">La Cuentoneta</h1>
				</a>
			</section>

			<section class="navigation flex items-center justify-end">
				<nav>
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
				<section class="mb-8 block grid-cols-2 grid-rows-2 md:hidden">
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
				</section>
			}
		</header>

		<div class="top-0 mb-2 h-1 w-full max-w-screen-lg overflow-hidden bg-gray-100">
			<div class="progress-bar h-full w-0 bg-primary-400"></div>
		</div>
	`,
	styles: `
		:host {
			@apply fixed top-0 z-10 flex w-full flex-col items-center bg-gray-100;
		}

		header {
			@apply grid;
			@apply mx-5 my-0 md:m-auto;
			@apply min-h-20 w-full max-w-screen-lg;

			/*Layout de grid para vistas md y superiores */
			@apply grid-cols-[1fr_theme(spacing.6)] grid-rows-[theme(spacing.20)_1fr];

			/*Layout de grid para vistas sm y menores */
			@apply md:grid-cols-2 md:grid-rows-1;
		}

		.nav-hidden {
			transform: translateY(-100%);
			transition: transform 0.3s ease-in-out;
		}

		@keyframes scrollbar {
			to {
				width: 100%;
			}
		}

		.progress-bar {
			transition-timing-function: ease-out;
			transition: width 0.5s;
			animation: scrollbar linear;
			animation-timeline: scroll(root);
		}
	`,
	standalone: true,
	imports: [CommonModule, RouterModule, NgOptimizedImage, HideOnScrollDirective],
})
export class HeaderComponent {
	readonly navLinks: InternalLink[] = [
		{ label: 'Inicio', path: '/home' },
		{ label: 'Nosotros', path: '/about' },
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
