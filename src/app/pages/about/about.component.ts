import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

@Component({
	selector: 'cuentoneta-about',
	imports: [CommonModule, NgOptimizedImage],
	hostDirectives: [MetaTagsDirective],
	templateUrl: './about.component.html',
})
export class AboutComponent {
	readonly links = {
		CONTRIBUTING: 'https://github.com/rolivencia/cuentoneta/blob/master/CONTRIBUTING.md',
		GITHUB_REPO: 'https://github.com/rolivencia/cuentoneta',
		FACEBOOK: 'https://facebook.com/cuentoneta',
		INSTAGRAM: 'https://instagram.com/cuentoneta',
		TWITTER: 'https://twitter.com/cuentoneta',
		DISCORD_CHANNEL: 'https://discord.com/channels/594363964499165194/1109220285841944586',
		DISCORD_SERVER: 'https://discord.com/invite/frontendcafe',
		FIGMA: 'https://www.figma.com/file/BIlQ6U3eh3M8vtYQt3vLNW/La-Cuentoneta-v2',
		GITHUB_CONTRIBUTORS: 'https://github.com/rolivencia/cuentoneta/tree/master#contribuyentes',
	};

	readonly programmers = [
		{
			name: 'Erik Giovani',
			url: 'https://github.com/erikgiovani',
			username: '@ErikGiovani',
		},
		{
			name: 'Juan Blas Tschopp',
			url: 'https://twitter.com/juanblas09',
			username: '@juanblas09',
		},
		{
			name: 'Diego Franchina',
			url: 'https://github.com/SoyDiego',
			username: '@SoyDiego',
		},
		{
			name: 'Jimer Espinoza',
			url: 'https://twitter.com/JimerSamuel',
			username: '@JimerSamuel',
		},
		{
			name: 'Soledad Sasia',
			url: 'https://github.com/SoleSasia',
			username: '@SoleSasia',
		},
		{
			name: 'Mia Ramos',
			url: 'https://github.com/MiaFate',
			username: '@MiaFate',
		},
		{
			name: 'Wilson Lasso',
			url: 'https://github.com/wilago',
			username: '@wilago',
		},
		{
			name: 'Gustavo Petruzzi',
			url: 'https://github.com/gustavoPetruzzi',
			username: '@gustavoPetruzzi',
		},
		{
			name: 'Juan Romero',
			url: 'https://github.com/Addin',
			username: '@Addin',
		},
		{
			name: 'Alexis Martínez',
			url: 'https://github.com/AlexRGB2',
			username: '@AlexRGB2',
		},
		{
			name: 'John Angel',
			url: 'https://github.com/Jeangel',
			username: '@Jeangel',
		},
		{
			name: 'Luciano Aieta',
			url: 'https://github.com/lgaieta',
			username: '@lgaieta',
		},
		{
			name: 'Nito Crespo',
			url: 'https://github.com/Nito-Crespi',
			username: '@Nito-Crespi',
		},
		{
			name: 'Abraham Borja',
			url: 'https://github.com/Aborja-dev',
			username: '@Aborja-dev',
		},
		{
			name: 'Silvia Trujillano',
			url: 'https://github.com/7SilviaT',
			username: '@7SilviaT',
		},
		{
			name: 'Luz Ojeda',
			url: 'https://github.com/luz-ojeda',
			username: '@luz-ojeda',
		},
		{
			name: 'Francisco Hanna',
			url: 'https://github.com/franciscohanna92',
			username: '@franciscohanna92',
		},
	];

	private metaTagsDirective = inject(MetaTagsDirective);
	constructor() {
		this.metaTagsDirective.setTitle('Nosotros');
		this.metaTagsDirective.setDefaultDescription();
	}
}
