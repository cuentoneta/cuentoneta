import { Directive, effect, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '../../utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { STORY_HOST } from './story-host';

@Directive({
	selector: '[cuentonetaStoryMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class StoryMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(STORY_HOST);

	// El canonical/og:url se deriva solo del slug (disponible sync desde el primer render), desacoplado
	// del gate en la entidad, para que la página nunca quede sin canonical aunque el fetch no haya resuelto.
	private readonly syncCanonicalEffect = effect(() => {
		this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Story}/${this.host.slug()}`));
	});

	protected applyMetaTags(): void {
		const story = this.host.story();
		if (!story) {
			return;
		}
		untracked(() => {
			this.head.setTitle(`${story.title} - ${story.author.name}`);
			this.head.setDescription(
				'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.head.setRobots('index, follow');
			this.head.setKeywords([
				'literatura',
				'poemas',
				'cuentos',
				story.title.toLowerCase(),
				story.author.name.toLowerCase(),
			]);
			this.head.setAuthor(story.author.name);
			this.head.setArticleDates(story.publishedAt, story.updatedAt);
		});
	}
}
