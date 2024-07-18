import { Directive } from '@angular/core';
import { TextBlockContent } from '@models/block-content.model';

@Directive({
	selector: 'ng-template[cuentonetaParagraphTemplateGuard]',
	standalone: true,
})
export class ParagraphTemplateDirective {
	static ngTemplateContextGuard(dir: ParagraphTemplateDirective, ctx: unknown): ctx is ParagraphContext {
		return true;
	}
}

interface ParagraphContext {
	$implicit: TextBlockContent;
}
