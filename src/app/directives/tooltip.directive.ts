import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { computePosition, flip, shift, arrow, offset } from '@floating-ui/dom';

@Directive({
	selector: '[cuentonetaTooltip]',
	standalone: true,
})
export class TooltipDirective implements OnDestroy {
	@Input() text!: string; // Texto para el Tooltip
	@Input() position!: 'top' | 'right' | 'bottom' | 'left'; // Posición del tooltip
	@Input() offset: number = 6; // Offset del tooltip respecto al elemento

	private myPopup: HTMLElement | null = null;

	constructor(private el: ElementRef) {}

	ngOnDestroy(): void {
		if (this.myPopup) {
			this.myPopup.remove();
		}
	}

	@HostListener('mouseenter') onMouseEnter() {
		this.createTooltipPopup();
	}

	@HostListener('mouseleave') onMouseLeave() {
		if (this.myPopup) {
			this.myPopup.remove();
		}
	}

	private createTooltipPopup() {
		const popup = document.createElement('p');
		popup.innerHTML = this.text;
		popup.classList.add('tooltip-container');

		const arrowElem = document.createElement('span');
		arrowElem.classList.add('tooltip-arrow');

		popup.appendChild(arrowElem);

		computePosition(this.el.nativeElement, popup, {
			placement: this.position,
			middleware: [flip(), shift({ padding: 5 }), arrow({ element: arrowElem }), offset(this.offset)],
		}).then(({ x, y, middlewareData }) => {
			Object.assign(popup.style, { top: `${y}px`, left: `${x}px` });

			if (middlewareData.arrow) {
				const { x: arrowX, y: arrowY } = middlewareData.arrow;
				const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[this.position];

				Object.assign(arrowElem.style, {
					left: arrowX != null ? `${arrowX}px` : '',
					top: arrowY != null ? `${arrowY}px` : '',
					bottom: '',
					[staticSide]: '-4px',
				});
			}
		});

		document.body.appendChild(popup);
		this.myPopup = popup;
	}
}
