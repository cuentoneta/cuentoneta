import { Component, effect, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InternalLink } from '@models/link.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HEADER_HEIGHT_STRING_PX } from '@utils/spacing.utils';
import { AppRoutes } from '../../app.routes';

const VisibilityState = Object.freeze({
	Visible: 'visible',
	Hidden: 'hidden',
} as const);
type VisibilityState = (typeof VisibilityState)[keyof typeof VisibilityState];

@Component({
	selector: 'cuentoneta-header',
	host: {
		// `z-nav` es la capa global de la barra fija: se usa sin aislar, porque confinar su apilamiento la
		// haría perder contra el contenido de página. Ningún componente necesita conocerla para no taparla —
		// los que elevan algo dentro de sí lo confinan con `isolate`.
		class: 'fixed top-0 z-nav w-full items-center justify-center border-b-1 border-neutral-200 md:m-auto',
	},
	template: `
		<header
			[@toggle]="isVisible()"
			class="nav-container grid w-full grid-cols-[1fr_theme(spacing.6)] grid-rows-[theme(spacing.16)_1fr] bg-neutral-50 px-5 md:grid-cols-2 md:grid-rows-1"
		>
			<section class="flex items-center">
				<!-- El nombre accesible sale del aria-label y no del contenido: el alt del logo más el
				texto de la marca leen "Logo de 'La Cuentoneta' La Cuentoneta", que no dice a dónde lleva. -->
				<a [routerLink]="['/', appRoutes.Home]" aria-label="La Cuentoneta — Inicio" class="flex">
					<img [ngSrc]="'./assets/svg/logo.svg'" class="mr-3" width="59" height="32" alt="Logo de 'La Cuentoneta'" />
					<span class="flex items-center font-inter text-lg font-bold">La Cuentoneta</span>
				</a>
			</section>

			<nav class="navigation flex items-center justify-end">
				<!-- El espaciado va como gap del contenedor y no como margen por ítem: así son N-1
				separaciones en vez de N, sin un margen inicial que no separa nada. -->
				<ul class="hidden md:flex md:gap-12">
					@for (navLink of navLinks; track navLink.path) {
						<li class="font-inter text-sm font-semibold text-neutral-900 hover:text-neutral-900/60">
							<a [routerLink]="navLink.path">{{ navLink.label }}</a>
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
		</header>
		@if (displayMenu()) {
			<nav class="block grid-cols-2 grid-rows-2 border-t-2 border-neutral-200 bg-neutral-50 md:hidden">
				<ul>
					@for (navLink of navLinks; track navLink.path) {
						<li
							class="flex h-12 items-center border-b-2 border-neutral-200 px-5 font-inter text-lg font-semibold text-neutral-900 hover:text-neutral-900/60"
						>
							<a (click)="onMenuTogglerClicked()" [routerLink]="navLink.path">{{ navLink.label }}</a>
						</li>
					}
				</ul>
			</nav>
			<div
				(click)="onMenuTogglerClicked()"
				(keypress)="onMenuTogglerClicked()"
				role="presentation"
				tabIndex="0"
				class="backdrop h-dvh bg-neutral-500/70"
			></div>
		}
	`,
	imports: [RouterModule, NgOptimizedImage],
	animations: [
		trigger('toggle', [
			state(
				VisibilityState.Visible,
				style({
					opacity: 1,
					transform: 'translateY(0)',
					height: HEADER_HEIGHT_STRING_PX,
				}),
			),
			state(
				VisibilityState.Hidden,
				style({
					opacity: 0,
					transform: 'translateY(-100%)',
					height: '0px',
				}),
			),
			transition(`${VisibilityState.Visible} => ${VisibilityState.Hidden}`, [animate('200ms ease-out')]),
			transition(`${VisibilityState.Hidden} => ${VisibilityState.Visible}`, [animate('200ms ease-in')]),
		]),
	],
})
export class HeaderComponent {
	protected readonly appRoutes = AppRoutes;
	protected readonly navLinks: InternalLink[] = [
		{ label: 'Inicio', path: `/${AppRoutes.Home}` },
		{ label: 'Obras', path: `/${AppRoutes.Story}` },
		{ label: 'Autores', path: `/${AppRoutes.Authors}` },
		{ label: 'Nosotros', path: `/${AppRoutes.About}` },
	];
	protected readonly displayMenu = signal(false);

	public readonly isVisible = input(VisibilityState.Visible, {
		transform: (value) => (value ? VisibilityState.Visible : VisibilityState.Hidden),
	});

	constructor() {
		effect(() => {
			if (this.isVisible() === VisibilityState.Hidden) {
				this.displayMenu.set(false);
			}
		});
	}

	protected onMenuTogglerClicked() {
		this.displayMenu.set(!this.displayMenu());
	}
}
