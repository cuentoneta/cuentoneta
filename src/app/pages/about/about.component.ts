import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { ContributorApi } from '../../providers/contributor-api.interface';
import { progressiveRxResource } from '@utils/ssr-resource';

@Component({
	selector: 'cuentoneta-about',
	imports: [NgOptimizedImage],
	hostDirectives: [HeadMetadataDirective],
	templateUrl: './about.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AboutComponent {
	protected readonly links = {
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

	private metaTagsDirective = inject(HeadMetadataDirective);
	private contributorService = inject(ContributorApi);

	// Ruta Server + `noindex, nofollow` con meta tags estáticos: bloquear el SSR solo agregaría latencia
	// por request sin beneficio de indexación. La grilla de colaboradores carga progresivamente en cliente.
	private readonly contributorsResource = progressiveRxResource({
		stream: () => this.contributorService.getAllByArea(),
		defaultValue: [],
	});

	protected readonly contributorsPerArea = computed(() => this.contributorsResource.value());

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Nosotros');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(buildCanonicalUrl('about'));
		this.metaTagsDirective.setRobots('noindex, nofollow');
	}
}
