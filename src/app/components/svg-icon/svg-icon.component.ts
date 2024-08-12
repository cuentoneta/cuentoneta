import { Component, input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BypassHtmlSanitizerPipe } from '../../pipes/bypass-html-sanitizer.pipe';

@Component({
	selector: 'cuentoneta-svg-icon',
	standalone: true,
	imports: [CommonModule, BypassHtmlSanitizerPipe],
	template: `<div [outerHTML]="svg() | bypassHtmlSanitizer"></div>`,
	styles: `
		cuentoneta-svg-icon {
			/*Se usa !important para sobreescribir estilos de tamaño defecto de íconos SVG span */
			svg {
				width: 16px !important;
				height: 16px !important;
			}
		}
	`,
	encapsulation: ViewEncapsulation.None,
})
export class SvgIconComponent {
	svg = input<string>('');
}
