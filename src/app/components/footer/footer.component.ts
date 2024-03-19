import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InternalLink, UrlLink } from '@models/link.model';

@Component({
	selector: 'cuentoneta-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss'],
	standalone: true,
	imports: [RouterModule, NgOptimizedImage],
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
			imageUrl: './assets/svg/whatsapp.svg',
			alt: 'Ícono de Whatsapp',
		},
		{
			url: 'https://twitter.com/cuentoneta',
			label: 'X',
			ariaLabel: `Perfil de X de 'La Cuentoneta'`,
			alt: 'Ícono de X',
			imageUrl: './assets/svg/twitter.svg',
		},
		{
			url: 'https://www.instagram.com/cuentoneta',
			label: 'Instagram',
			ariaLabel: `Perfil de Instagram de 'La Cuentoneta'`,
			alt: 'Ícono de Instagram',
			imageUrl: './assets/svg/instagram.svg',
		},
		{
			url: 'https://www.facebook.com/lacuentoneta',
			label: 'Facebook',
			ariaLabel: `Página de Facebook de 'La Cuentoneta'`,
			alt: 'Ícono de Facebook',
			imageUrl: './assets/svg/facebook.svg',
		},
		{
			url: 'https://github.com/cuentoneta/cuentoneta',
			label: 'Github',
			ariaLabel: `Repositorio de Github de 'La Cuentoneta'`,
			alt: 'Ícono de Github',
			imageUrl: './assets/svg/github.svg',
		},
		{
			url: 'mailto:contacto@cuentoneta.ar',
			label: 'Enviar un Correo Electrónico',
			ariaLabel: `Email de 'La Cuentoneta'`,
			alt: 'Ícono de sobre de carta',
			imageUrl: './assets/svg/email.svg',
		},
	];

	displayMenu = false;

	onMenuTogglerClicked(event: Event) {
		this.displayMenu = !this.displayMenu;
	}
}
