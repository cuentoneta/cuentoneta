import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlockContent } from '@models/block-content.model';
import { PortableTextDirective } from '../../directives/portable-text-parser/portable-text-parser.directive';

@Component({
	selector: 'cuentoneta-portable-text-parser',
	imports: [CommonModule, PortableTextDirective],
	template: `
		@if (type() === 'paragraph') {
			@for (paragraph of paragraphs(); track $index) {
				<p [portableText]="paragraph" [classes]="classes()" cuentonetaPortableText></p>
			}
		} @else if (type() === 'span') {
			@for (paragraph of paragraphs(); track $index) {
				<span [portableText]="paragraph" [classes]="classes()" cuentonetaPortableText></span>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextParserComponent {
	paragraphs = input.required<TextBlockContent[]>();
	type = input<'paragraph' | 'span'>('paragraph');
	classes = input<string>('classes');
}
