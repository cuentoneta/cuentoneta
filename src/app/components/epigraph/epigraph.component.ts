import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Epigraph } from '@models/story.model';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-story-epigraph',
	imports: [CommonModule, PortableTextParserComponent],
	template: `
		<div class="mr-4 border-l-3 border-solid border-primary-500"></div>
		<div class="source-serif-pro-body-lg flex flex-1 flex-col flex-wrap items-end justify-end text-gray-700">
			<cuentoneta-portable-text-parser
				[classes]="'self-baseline'"
				[paragraphs]="epigraph().text"
			></cuentoneta-portable-text-parser>
			<div class="text-end">
				@if (epigraph().reference) {
					<em>
						<cuentoneta-portable-text-parser
							[classes]="'self-baseline'"
							[paragraphs]="epigraph().reference"
						></cuentoneta-portable-text-parser
					></em>
				}
			</div>
		</div>
	`,
	styles: `
		:host {
			@apply flex;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpigraphComponent {
	epigraph = input.required<Epigraph>();
}
