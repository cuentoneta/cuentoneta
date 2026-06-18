import { Directive, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { environment } from '../../environments/environment';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractPageSeoDirective } from '../../directives/abstract-page-seo.directive';
import { STORY_SEO_HOST } from './story-seo-host';
import { buildStoryArticleSchema, buildStoryBreadcrumb } from './story.schema';

@Directive({
	selector: '[cuentonetaStorySeo]',
	hostDirectives: [HeadMetadataDirective],
})
export class StorySeoDirective extends AbstractPageSeoDirective {
	private readonly host = inject(STORY_SEO_HOST);

	protected applySeoTags(): void {
		const story = this.host.story();
		if (!story) {
			return;
		}
		untracked(() => {
			this.meta.setTitle(`${story.title} - ${story.author.name}`);
			this.meta.setDescription(
				'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
			);
			this.meta.setCanonicalUrl(`${environment.website}/${AppRoutes.Story}/${story.slug}`);
			this.meta.setRobots('index, follow');
			this.meta.setKeywords([
				'literatura',
				'poemas',
				'cuentos',
				story.title.toLowerCase(),
				story.author.name.toLowerCase(),
			]);
			this.meta.setAuthor(story.author.name);
			this.meta.setArticleDates(story.publishedAt, story.updatedAt);
			this.schemaOrg.setJsonLd('article', buildStoryArticleSchema(story, environment.website));
			this.schemaOrg.setJsonLd('breadcrumb-story', buildStoryBreadcrumb(story, environment.website));
		});
	}

	protected override removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('article');
		this.schemaOrg.removeJsonLd('breadcrumb-story');
	}
}
