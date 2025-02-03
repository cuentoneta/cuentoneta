import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlockContent } from '@models/block-content.model';
import { PortableTextParserService } from './portable-text-parser.service';

@Component({
	selector: 'cuentoneta-portable-text-parser',
	imports: [CommonModule],
	template: `
		@if (type() === 'paragraph') {
			@for (paragraph of parsedParagraphs(); track $index) {
				<p [ngClass]="paragraph.classes" [innerHTML]="paragraph.text"></p>
			}
		} @else if (type() === 'span') {
			@for (paragraph of parsedParagraphs(); track $index) {
				<span [ngClass]="paragraph.classes" [innerHTML]="paragraph.text"></span>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextParserComponent {
	paragraphs = input.required<TextBlockContent[]>();
	type = input<'paragraph' | 'span'>('paragraph');
	classes = input<string>('classes');

	parsedParagraphs = computed(() =>
		this.paragraphs().map((paragraph) => ({
			text: this.parser.parseParagraph(paragraph),
			classes: this.parser.appendClasses(paragraph, this.classes()),
		})),
	);

	private parser = inject(PortableTextParserService);
}
