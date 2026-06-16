import { Directive, ElementRef, effect, inject, signal } from '@angular/core';
import { computePosition, flip, shift, arrow, offset } from '@floating-ui/dom';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

@Directive({
	selector: '[cuentonetaTooltip]',
	host: {
		'(mouseenter)': 'onMouseEnter()',
		'(mouseleave)': 'onMouseLeave()',
	},
})
export class TooltipDirective {
	public readonly text = signal<string>('');
	public readonly position = signal<TooltipPosition>('top');
	public readonly offset = signal<number>(6);

	private myPopup: HTMLElement | null = null;
	private readonly el = inject(ElementRef);

	private readonly removePopupOnDestroy = effect((onCleanup) => {
		onCleanup(() => this.myPopup?.remove());
	});

	protected onMouseEnter() {
		this.createTooltipPopup();
	}

	protected onMouseLeave() {
		if (this.myPopup) {
			this.myPopup.remove();
		}
	}

	private createTooltipPopup() {
		const popup = document.createElement('p');
		popup.innerHTML = this.text();
		popup.classList.add('tooltip-container');

		const arrowElem = document.createElement('span');
		arrowElem.classList.add('tooltip-arrow');

		popup.appendChild(arrowElem);

		computePosition(this.el.nativeElement, popup, {
			placement: this.position(),
			middleware: [flip(), shift({ padding: 5 }), arrow({ element: arrowElem }), offset(this.offset())],
		}).then(({ x, y, middlewareData }) => {
			Object.assign(popup.style, { top: `${y}px`, left: `${x}px` });

			if (middlewareData.arrow) {
				const { x: arrowX, y: arrowY } = middlewareData.arrow;
				const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[this.position()];

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
