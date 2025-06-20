
import { Component, input } from '@angular/core';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { TextBlockContent } from '@models/block-content.model';

@Component({
	selector: 'cuentoneta-story-card-content',
	imports: [PortableTextParserComponent],
	template: `
		<section>
			<h1 class="inter-body-xl-bold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ title() }}</h1>
			<cuentoneta-portable-text-parser
				[type]="'span'"
				[paragraphs]="body()"
				data-testid="portable-text-parser"
				class="sm:source-serif-pro-body-base hidden sm:relative sm:line-clamp-3 sm:min-h-18 sm:text-ellipsis sm:text-justify"
			/>
		</section>
	`,
})
export class StoryCardContentComponent {
	readonly title = input.required<string>();
	readonly body = input.required<TextBlockContent[]>();
}
