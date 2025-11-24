import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';

import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { environment } from '../../environments/environment';
import { ContributorService } from '../../providers/contributor.service';

@Component({
	selector: 'cuentoneta-about',
	imports: [NgOptimizedImage],
	hostDirectives: [MetaTagsDirective],
	providers: [ContributorService],
	templateUrl: './about.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AboutComponent {
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

	private metaTagsDirective = inject(MetaTagsDirective);
	private contributorService = inject(ContributorService);

	readonly contributorsResource = rxResource({
		stream: () => this.contributorService.getAllByArea(),
		defaultValue: [],
	});

	readonly contributorsPerArea = computed(() => this.contributorsResource.value());

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Nosotros');
		this.metaTagsDirective.setDefaultDescription();
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}/about`);
		this.metaTagsDirective.setRobots('noindex, nofollow');
	}
}
