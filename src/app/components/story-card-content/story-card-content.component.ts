import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { TextBlockContent } from '@models/block-content.model';

@Component({
	selector: 'cuentoneta-story-card-content',
	standalone: true,
	imports: [CommonModule, PortableTextParserComponent, NgOptimizedImage],
	template: `
		<section>
			<h1 class="inter-body-xl-bold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ title() }}</h1>
			<cuentoneta-portable-text-parser
				[type]="'span'"
				[paragraphs]="body()"
				class="sm:source-serif-pro-body-base hidden sm:relative sm:line-clamp-3 sm:min-h-18 sm:text-ellipsis sm:text-justify"
			></cuentoneta-portable-text-parser>
		</section>
	`,
})
export class StoryCardContentComponent {
	title = input.required<string>();
	body = input.required<TextBlockContent[]>();
}
