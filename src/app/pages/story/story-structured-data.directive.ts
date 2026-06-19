import { Directive, inject, untracked } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractStructuredDataDirective } from '../../directives/abstract-structured-data.directive';
import { STORY_HOST } from './story-host';
import { buildStoryArticleSchema, buildStoryBreadcrumb } from './story.schema';

@Directive({
	selector: '[cuentonetaStoryStructuredData]',
})
export class StoryStructuredDataDirective extends AbstractStructuredDataDirective {
	private readonly host = inject(STORY_HOST);

	protected applyStructuredData(): void {
		const story = this.host.story();
		if (!story) {
			return;
		}
		untracked(() => {
			this.schemaOrg.setPageScopedJsonLd('article', buildStoryArticleSchema(story, environment.website));
			this.schemaOrg.setPageScopedJsonLd('breadcrumb-story', buildStoryBreadcrumb(story, environment.website));
		});
	}

	protected removeStructuredData(): void {
		this.schemaOrg.removeJsonLd('article');
		this.schemaOrg.removeJsonLd('breadcrumb-story');
	}
}
