import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TextBlockContent } from '@models/block-content.model';
import { PortableTextDirective } from '../../directives/portable-text-parser/portable-text-parser.directive';

type TextBlockType = 'regular' | 'heading' | 'ordered-list' | 'unordered-list';
interface ParagraphGroup {
	paragraphs: TextBlockContent[];
	type: TextBlockType;
}

@Component({
	selector: 'cuentoneta-portable-text-parser',
	imports: [PortableTextDirective],
	template: `
		@for (group of groups(); track $index) {
			@switch (group.type) {
				@case ('unordered-list') {
					<ul class="list-disc">
						@for (paragraph of group.paragraphs; track $index) {
							<li [portableText]="paragraph" [classes]="classes()" cuentonetaPortableText></li>
						}
					</ul>
				}
				@case ('ordered-list') {
					<ol class="list-decimal">
						@for (paragraph of group.paragraphs; track $index) {
							<li [portableText]="paragraph" [classes]="classes()" cuentonetaPortableText></li>
						}
					</ol>
				}
				@default {
					@for (paragraph of group.paragraphs; track $index) {
						<p [portableText]="paragraph" [classes]="classes()" cuentonetaPortableText></p>
					}
				}
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortableTextParserComponent {
	readonly paragraphs = input.required<TextBlockContent[]>();
	readonly classes = input<string>('classes');

	readonly groups = computed(() => {
		let currentGroupIndex = 0;
		const groups: ParagraphGroup[] = [];

		return this.paragraphs().reduce((groups, current) => {
			// Caso para array de grupos vacío: Agrega el primero, configura el tip y retorna
			if (groups.length === 0) {
				groups.push({
					paragraphs: [current],
					type: this.assignTextBlockType(current),
				});
				return groups;
			}

			// Para el caso general, obtiene el grupo actual y el tipo del bloque actual procesado en el reducer
			const currentGroup = groups[currentGroupIndex];
			const currentType = this.assignTextBlockType(current);

			// Si el grupo del bloque actual coincide con el del grupo actual, simplemente se agrega el bloque al grupo
			if (currentGroup.type === currentType) {
				currentGroup.paragraphs.push(current);
			} else {
				// Sino se genera un grupo nuevo con un tipo nuevo y se agrega el bloque al grupo
				currentGroupIndex++;
				groups.push({
					paragraphs: [current],
					type: currentType,
				});
			}

			return groups;
		}, groups);
	});

	private assignTextBlockType(textBlock: TextBlockContent): TextBlockType {
		if (textBlock.listItem === 'bullet') {
			return 'unordered-list';
		} else if (textBlock.listItem === 'number') {
			return 'ordered-list';
		} else {
			return 'regular';
		}
	}
}
