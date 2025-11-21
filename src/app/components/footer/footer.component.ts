import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InternalLink, UrlLink } from '@models/link.model';
import {
	faBrandFacebook,
	faBrandGithub,
	faBrandInstagram,
	faBrandWhatsapp,
	faBrandXTwitter,
} from '@ng-icons/font-awesome/brands';
import { faSolidEnvelope } from '@ng-icons/font-awesome/solid';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';

@Component({
	selector: 'cuentoneta-footer',
	imports: [RouterModule, NgIcon, NgOptimizedImage],
	providers: [
		provideIcons({
			faBrandWhatsapp,
			faBrandXTwitter,
			faBrandInstagram,
			faBrandFacebook,
			faBrandGithub,
			faSolidEnvelope,
		}),
		provideNgIconsConfig({ size: '20px' }),
	],
	template: `
		<footer class="">
			<div class="container grid h-full max-w-(--breakpoint-lg) items-center justify-between">
				<section class="logo">
					<img [ngSrc]="'./assets/svg/logo.svg'" width="49" height="26" alt="Logo de 'La Cuentoneta'" />
				</section>
				<section class="navigation">
					<nav>
						<ul class="justify-left inter-body-sm-semibold flex lg:justify-center">
							@for (link of navLinks; track $index) {
								<li class="max-sm:inter-body-xs-bold hover:text-interactive-500">
									<a routerLink="{{ link.path }}">{{ link.label }}</a>
								</li>
							}
						</ul>
					</nav>
				</section>
				<section class="social">
					<nav>
						<ul class="flex items-center">
							@for (link of socialLinks; track $index) {
								<li class="flex items-center">
									<a [attr.aria-label]="link.ariaLabel" [href]="link.url">
										<ng-icon [name]="link.icon" [attr.alt]="link.alt" />
									</a>
								</li>
							}
						</ul>
					</nav>
				</section>
			</div>
		</footer>
	`,
	styles: `
		footer {
			@apply border-primary-500 mt-[120px] w-full border-t-1 border-solid bg-white max-sm:px-5 max-sm:py-8 sm:h-[98px];
		}

		.container {
			@apply columns-1 gap-6;
			@apply sm:mx-5 sm:my-0 sm:grid-cols-[0.15fr_1fr_0.5fr];
			@apply lg:m-auto lg:grid-cols-[0.25fr_1fr_0.25fr];
		}

		.navigation {
			li {
				&:not(:last-child) {
					@apply mr-8 lg:mr-12;
				}
			}
		}

		.social {
			@apply sm:ml-auto;

			li {
				&:not(:last-child) {
					@apply mr-8 sm:mr-6 md:mr-8;
				}
			}
		}
	`,
})
export class FooterComponent {
	readonly navLinks: InternalLink[] = [
		{ path: '/', label: 'Inicio' },
		{ path: '/about', label: 'Acerca de' },
		{ path: '/dmca', label: 'DMCA' },
	];

	readonly socialLinks: UrlLink[] = [
		{
			url: 'https://whatsapp.com/channel/0029VaC3aCSJuyAGTU2tC02F',
			label: 'Whatsapp',
			ariaLabel: `Canal de Whatsapp de 'La Cuentoneta'`,
			icon: 'faBrandWhatsapp',
			alt: 'Ícono de Whatsapp',
		},
		{
			url: 'https://twitter.com/cuentoneta',
			label: 'X',
			ariaLabel: `Perfil de X de 'La Cuentoneta'`,
			alt: 'Ícono de X',
			icon: 'faBrandXTwitter',
		},
		{
			url: 'https://www.instagram.com/cuentoneta',
			label: 'Instagram',
			ariaLabel: `Perfil de Instagram de 'La Cuentoneta'`,
			alt: 'Ícono de Instagram',
			icon: 'faBrandInstagram',
		},
		{
			url: 'https://www.facebook.com/cuentoneta',
			label: 'Facebook',
			ariaLabel: `Página de Facebook de 'La Cuentoneta'`,
			alt: 'Ícono de Facebook',
			icon: 'faBrandFacebook',
		},
		{
			url: 'https://github.com/cuentoneta/cuentoneta',
			label: 'Github',
			ariaLabel: `Repositorio de Github de 'La Cuentoneta'`,
			alt: 'Ícono de Github',
			icon: 'faBrandGithub',
		},
		{
			url: 'mailto:contacto@cuentoneta.ar',
			label: 'Enviar un Correo Electrónico',
			ariaLabel: `Email de 'La Cuentoneta'`,
			alt: 'Ícono de sobre de carta',
			icon: 'faSolidEnvelope',
		},
	];
}
