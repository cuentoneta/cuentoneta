import { Injectable } from '@angular/core';
import { MarkDef, TextBlockContent } from '@models/block-content.model';

@Injectable({
	providedIn: 'root',
})
export class PortableTextParserService {
	constructor() {}

	public parseParagraph(blockContent: TextBlockContent): string {
		let paragraph = '';
		blockContent.children.forEach((block) => {
			let part = block.text;
			let marks = (block.marks ?? []).slice(0);

			if (marks.includes('em')) {
				marks = marks.filter((mark) => mark !== 'em');
				part = this.addEmphasis(part);
			}
			if (marks.includes('strong')) {
				marks = marks.filter((mark) => mark !== 'strong');
				part = this.addStrong(part);
			}

			// TODO: Agregar procesamiento de otros tipos de marks (h1, h2, highlight, tachado, subrayado, etc.)

			if (blockContent.markDefs.length > 0 && marks.length > 0) {
				blockContent.markDefs?.forEach((markDef) => {
					switch (markDef._type) {
						case 'link':
							part = this.addUrl(part, this.findUrlFromMarks(blockContent.markDefs, block.marks));
							break;
						default:
							break;
					}
				});
			}

			part = part.replaceAll('\n', '<br/>');

			paragraph = paragraph.concat(part);
		});
		return paragraph;
	}

	appendClasses(paragraph: TextBlockContent, classes: string): string {
		const blocks = paragraph.children;
		const includeSeparators = blocks.filter((block) => block.text.includes('***')).length > 0;

		if (includeSeparators) {
			classes = `text-center ${classes}`;
		}

		return classes;
	}

	private addEmphasis(text: string): string {
		return `<i>${text}</i>`;
	}

	private addStrong(text: string): string {
		return `<b>${text}</b>`;
	}

	private addUrl(text: string, url: string): string {
		return `<a href="${url}" class="underline">${text}</a>`;
	}

	private findUrlFromMarks(markDefs: MarkDef[], marks?: string[]): string {
		if (!marks) return '#';
		return markDefs.find((mark) => marks.includes(mark._key))?.href ?? '#';
	}
}
