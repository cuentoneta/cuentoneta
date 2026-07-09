import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { STORY_HOST } from './story-host';

@Directive({
	selector: '[cuentonetaStoryMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class StoryMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(STORY_HOST);

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
			this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Story}/${story.slug}`));
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
