import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockContent, MarkDef } from '@models/block-content.model';
import { PortableTextMarksSerializerComponent } from '../portable-text-styles-marks-serializer/portable-text-marks-serializer.component';

@Component({
	selector: 'cuentoneta-portable-text-parser',
	standalone: true,
	imports: [CommonModule, PortableTextMarksSerializerComponent],
	template: `
		@for (paragraph of paragraphs(); track $index) {
			<p [ngClass]="appendClasses(paragraph)" class="source-serif-pro-body-xl mb-8 leading-8">
				@for (block of paragraph.children; track $index) {
					<cuentoneta-portable-text-marks-serializer
						[text]="block.text"
						[marks]="block.marks ?? []"
						[markDefs]="paragraph.markDefs ?? []"
					></cuentoneta-portable-text-marks-serializer>
				}
			</p>
		}
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextParserComponent {
	paragraphs = input.required<BlockContent[]>();

	appendClasses(paragraph: BlockContent): string {
		const blocks = paragraph.children;
		const includeSeparators = blocks.filter((block) => block.text.includes('***')).length > 0;

		let classes = '';

		if (includeSeparators) {
			classes = `text-center ${classes}`;
		}

		return classes;
	}
}
