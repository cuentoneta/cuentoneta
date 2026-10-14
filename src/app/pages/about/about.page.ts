import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';

import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { ContributorApi } from '../../providers/contributor.provider';

@Component({
	selector: 'cuentoneta-about',
	imports: [NgOptimizedImage],
	hostDirectives: [HeadMetadataDirective],
	templateUrl: './about.page.html',
})
export default class AboutPage {
	private readonly links = {
		CONTRIBUTING: 'https://github.com/cuentoneta/cuentoneta/blob/master/CONTRIBUTING.md',
		GITHUB_REPO: 'https://github.com/cuentoneta/cuentoneta',
		FACEBOOK: 'https://facebook.com/cuentoneta',
		INSTAGRAM: 'https://instagram.com/cuentoneta',
		TWITTER: 'https://twitter.com/cuentoneta',
		DISCORD_CHANNEL: 'https://discord.com/channels/594363964499165194/1109220285841944586',
		DISCORD_SERVER: 'https://discord.com/invite/frontendcafe',
		FIGMA: 'https://www.figma.com/file/BIlQ6U3eh3M8vtYQt3vLNW/La-Cuentoneta-v2',
		// El ancla anterior (#contribuyentes) apuntaba a una sección que el README ya no tiene, y que
		// además remite de vuelta a esta misma página: el listado que GitHub genera es el destino real.
		GITHUB_CONTRIBUTORS: 'https://github.com/cuentoneta/cuentoneta/graphs/contributors',
	};

	private readonly metaTagsDirective = inject(HeadMetadataDirective);
	private readonly contributorService = inject(ContributorApi);

	private readonly contributorsResource = rxResource({
		stream: () => this.contributorService.getAllByArea(),
		defaultValue: [],
	});

	private readonly contributorsPerArea = computed(() => this.contributorsResource.value());

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
