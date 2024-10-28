import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlockContent } from '@models/block-content.model';
import { PortableTextMarksSerializerComponent } from '../portable-text-styles-marks-serializer/portable-text-marks-serializer.component';
import { ParagraphTemplateDirective } from './paragraph-template.directive';

@Component({
	selector: 'cuentoneta-portable-text-parser',
	standalone: true,
	imports: [CommonModule, PortableTextMarksSerializerComponent, ParagraphTemplateDirective],
	template: `
		@if (type() === 'paragraph') {
			@for (paragraph of paragraphs(); track $index) {
				<p [ngClass]="appendClasses(paragraph)">
					<ng-container *ngTemplateOutlet="serializer; context: { $implicit: paragraph }"></ng-container>
				</p>
			}
		} @else if (type() === 'span') {
			@for (paragraph of paragraphs(); track $index) {
				<span [ngClass]="appendClasses(paragraph)">
					<ng-container *ngTemplateOutlet="serializer; context: { $implicit: paragraph }"></ng-container>
				</span>
			}
		}

		<ng-template #serializer cuentonetaParagraphTemplateGuard let-paragraph>
			@for (block of paragraph.children; track $index) {
				<cuentoneta-portable-text-marks-serializer
					[text]="block.text"
					[marks]="block.marks ?? []"
					[markDefs]="paragraph.markDefs"
				></cuentoneta-portable-text-marks-serializer>
			}
		</ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextParserComponent {
	paragraphs = input.required<TextBlockContent[]>();
	type = input<'paragraph' | 'span'>('paragraph');
	classes = input<string>('classes');

	appendClasses(paragraph: TextBlockContent): string {
		const blocks = paragraph.children;
		const includeSeparators = blocks.filter((block) => block.text.includes('***')).length > 0;

		let classes = this.classes();

		if (includeSeparators) {
			classes = `text-center ${classes}`;
		}

		return classes;
	}
}
