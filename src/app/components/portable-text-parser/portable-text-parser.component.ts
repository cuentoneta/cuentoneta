import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockContent } from '@models/block-content.model';
import { PortableTextMarksSerializerComponent } from '../portable-text-styles-marks-serializer/portable-text-marks-serializer.component';

@Component({
	selector: 'cuentoneta-portable-text-parser',
	standalone: true,
	imports: [CommonModule, PortableTextMarksSerializerComponent],
	template: `
		@if (type() === 'paragraph') {
			@for (paragraph of paragraphs(); track $index) {
				<p [ngClass]="appendClasses(paragraph)">
					@for (block of paragraph.children; track $index) {
						<cuentoneta-portable-text-marks-serializer
							[text]="block.text"
							[marks]="block.marks ?? []"
							[markDefs]="paragraph.markDefs ?? []"
						></cuentoneta-portable-text-marks-serializer>
					}
				</p>
			}
		} @else if (type() === 'span') {
			@for (paragraph of paragraphs(); track $index) {
				<span [ngClass]="appendClasses(paragraph)">
					@for (block of paragraph.children; track $index) {
						<cuentoneta-portable-text-marks-serializer
							[text]="block.text"
							[marks]="block.marks ?? []"
							[markDefs]="paragraph.markDefs ?? []"
						></cuentoneta-portable-text-marks-serializer>
					}
				</span>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextParserComponent {
	paragraphs = input.required<BlockContent[]>();
	type = input<'paragraph' | 'span'>('paragraph');

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
