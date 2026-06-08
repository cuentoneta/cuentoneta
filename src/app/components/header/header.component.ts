import { Component, effect, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InternalLink } from '@models/link.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HEADER_HEIGHT_STRING_PX } from '@utils/spacing.utils';

enum VisibilityState {
	Visible = 'visible',
	Hidden = 'hidden',
}

@Component({
	selector: 'cuentoneta-header',
	host: {
		class: 'fixed top-0 z-10 w-full items-center justify-center border-b-1 border-neutral-200 md:m-auto',
	},
	template: `
		<header
			[@toggle]="isVisible()"
			class="nav-container grid w-full grid-cols-[1fr_theme(spacing.6)] grid-rows-[theme(spacing.16)_1fr] bg-neutral-50 px-5 md:grid-cols-2 md:grid-rows-1"
		>
			<section class="flex items-center">
				<a [routerLink]="['/', 'home']" class="flex">
					<img [ngSrc]="'./assets/svg/logo.svg'" class="mr-3" width="59" height="32" alt="Logo de 'La Cuentoneta'" />
					<h1 class="flex items-center font-inter text-lg font-bold">La Cuentoneta</h1>
				</a>
			</section>

			<nav class="navigation flex items-center justify-end">
				<ul class="flex hidden md:flex">
					@for (navLink of navLinks; track $index) {
						<li class="font-inter text-sm font-semibold text-neutral-900 hover:text-neutral-900/60 md:ml-12">
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
		</header>
		@if (displayMenu()) {
			<nav class="block grid-cols-2 grid-rows-2 border-t-2 border-neutral-200 bg-neutral-50 md:hidden">
				<ul>
					@for (navLink of navLinks; track $index) {
						<li
							class="flex h-12 items-center border-b-2 border-neutral-200 px-5 font-inter text-lg font-semibold text-neutral-900 hover:text-neutral-900/60"
						>
							<a
								(click)="onMenuTogglerClicked()"
								[routerLink]="navLink.path"
								[tabindex]="navLink.label === 'Inicio' ? -1 : 0"
								[attr.aria-hidden]="navLink.label === 'Inicio'"
								>{{ navLink.label }}</a
							>
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
	readonly navLinks: InternalLink[] = [
		{ label: 'Inicio', path: '/home' },
		{ label: 'Nosotros', path: '/about' },
	];
	readonly displayMenu = signal(false);

	readonly isVisible = input(VisibilityState.Visible, {
		transform: (value) => (value ? VisibilityState.Visible : VisibilityState.Hidden),
	});

	constructor() {
		effect(() => {
			if (this.isVisible() === VisibilityState.Hidden) {
				this.displayMenu.set(false);
			}
		});
	}

	onMenuTogglerClicked() {
		this.displayMenu.set(!this.displayMenu());
	}
}
