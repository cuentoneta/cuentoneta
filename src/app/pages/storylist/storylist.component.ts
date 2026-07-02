// Core
import { Component, computed, forwardRef, input } from '@angular/core';

// Models
import { type Storylist } from '@models/storylist.model';

// SEO
import { StorylistMetaTagsDirective } from './storylist-meta-tags.directive';
import { StorylistStructuredDataDirective } from './storylist-structured-data.directive';
import { STORYLIST_HOST, type StorylistHost } from './storylist-host';

// Componentes
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import Tabs from '@components/tabs/tabs.component';
import Tab from '@components/tabs/tab.component';
import { StorylistTitle } from './storylist-title/storylist-title';
import { StoryCardTeaserComponent } from '@components/story-card-teaser/story-card-teaser.component';
import { StoryCardTeaserSkeletonComponent } from '@components/story-card-teaser/story-card-teaser-skeleton.component';
import { MediaResourceComponent } from '@components/media-resource/media-resource.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-storylist',
	templateUrl: './storylist.component.html',
	imports: [
		SkeletonComponent,
		PortableTextParserComponent,
		Tabs,
		Tab,
		StoryCardTeaserComponent,
		StoryCardTeaserSkeletonComponent,
		StorylistTitle,
		MediaResourceComponent,
	],
	providers: [{ provide: STORYLIST_HOST, useExisting: forwardRef(() => StorylistComponent) }],
	hostDirectives: [StorylistMetaTagsDirective, StorylistStructuredDataDirective],
})
export default class StorylistComponent implements StorylistHost {
	// Route inputs
	public readonly slug = input.required<string>();
	public readonly storylist = input.required<Storylist>();
	public readonly activeTab = input<'stories' | 'about' | string>('stories');

	// Cantidad de líneas del skeleton de la descripción mientras carga
	protected readonly descriptionSkeletonLines = Array.from({ length: 10 });

	// Propiedades derivadas
	protected readonly stories = computed(() => this.storylist().stories);
	protected readonly tabs = computed(() => this.storylist().tabs);
	protected readonly media = computed(() => this.storylist().media);
	protected readonly hasMedia = computed(() => this.media().length > 0);
}
