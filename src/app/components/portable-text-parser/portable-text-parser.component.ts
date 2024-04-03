import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockContent, MarkDef } from '@models/block-content.model';

@Component({
	selector: 'cuentoneta-portable-text-parser',
	standalone: true,
	imports: [CommonModule],
	template: `
		@for (paragraph of paragraphs(); track $index) {
			<p [ngClass]="appendClasses(paragraph)" class="source-serif-pro-body-xl mb-8 leading-8">
				@for (block of paragraph.children; track $index) {
					<ng-container
						*ngTemplateOutlet="
							blockTextStyleMarksParser;
							context: { contextItem: { text: block.text, marks: block.marks ?? [], markDefs: paragraph.markDefs } }
						"
					></ng-container>
				}
			</p>
		}

		<ng-template #applyBold let-block="contextItem">
			<b
				><ng-container
					*ngTemplateOutlet="
						blockTextStyleMarksParser;
						context: { contextItem: { text: block.text, marks: block.marks, markDefs: block.markDefs } }
					"
				></ng-container
			></b>
		</ng-template>

		<ng-template #applyItalics let-block="contextItem">
			<i
				><ng-container
					*ngTemplateOutlet="
						blockTextStyleMarksParser;
						context: { contextItem: { text: block.text, marks: block.marks, markDefs: block.markDefs } }
					"
				></ng-container
			></i>
		</ng-template>

		<ng-template #blockTextStyleMarksParser let-block="contextItem">
			<!-- Caso base: no se aplica ningún estilo y se interpola la cadena de texto -->
			@if (block.marks.length === 0) {
				<!-- Chequeo de saltos de línea -->
				@for (text of splitLineBreaks(block.text); let index = $index; track index) {
					{{ text }}
					@if (index !== splitLineBreaks(block.text).length - 1) {
						<br />
					}
				}
			} @else if (block.marks[0] === 'strong') {
				<!-- Comienza a recorrer el arreglo de marks aplicando negrita -->
				<ng-container
					*ngTemplateOutlet="
						applyBold;
						context: {
							contextItem: {
								text: block.text,
								currentMark: block.marks[0],
								marks: block.marks.slice(1),
								markDefs: block.markDefs
							}
						}
					"
				>
				</ng-container>
			} @else if (block.marks[0] === 'em') {
				<!-- Comienza a recorrer el arreglo de marks aplicando itálicas -->
				<ng-container
					*ngTemplateOutlet="
						applyItalics;
						context: {
							contextItem: {
								text: block.text,
								currentMark: block.marks[0],
								marks: block.marks.slice(1),
								markDefs: block.markDefs
							}
						}
					"
				></ng-container>
			} @else if (block.marks[0]) {
				<!-- Comienza a recorrer el arreglo de marks aplicando markDefs -->
				@for (markDef of block.markDefs; track $index) {
					@if (markDef._key === block.marks[0]) {
						@switch (markDef._type) {
							@case ('link') {
								<ng-container
									*ngTemplateOutlet="
										applyUrl;
										context: {
											contextItem: {
												text: block.text,
												currentMark: block.marks[0],
												marks: block.marks.slice(1),
												markDefs: block.markDefs
											}
										}
									"
								></ng-container>
							}
						}
					}
				}
			}
		</ng-template>

		<ng-template #applyUrl let-block="contextItem">
			<a class="underline" [href]="findUrlFromMarks(block.markDefs, block.currentMark)"
				><ng-container
					*ngTemplateOutlet="
						blockTextStyleMarksParser;
						context: {
							contextItem: {
								text: block.text,
								currentMark: block.marks[0],
								marks: block.marks,
								markDefs: block.markDefs
							}
						}
					"
				></ng-container
			></a>
		</ng-template>
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

	findUrlFromMarks(markDefs: MarkDef[], currentMark: string): string {
		return markDefs.find((mark) => mark._key === currentMark)?.href ?? '#';
	}

	splitLineBreaks(text: string): string[] {
		return text.split('\n');
	}
}
