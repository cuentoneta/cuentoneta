import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';

@Directive({
	selector: '[tooltip]',
	standalone: true,
})
export class TooltipDirective implements OnDestroy {
	@Input() text!: string; // Texto para el Tooltip
	@Input() position!: string; // Posición del tooltip

	private myPopup: any;

	constructor(private el: ElementRef) {}

	ngOnDestroy(): void {
		if (this.myPopup) {
			this.myPopup.remove();
		}
	}

	@HostListener('mouseenter') onMouseEnter() {
		let x;
		let y;

		if (this.position === 'bottom') {
			x = this.el.nativeElement.getBoundingClientRect().left + this.el.nativeElement.offsetWidth / 2;
			y = this.el.nativeElement.getBoundingClientRect().top + this.el.nativeElement.offsetHeight + 6;
		} else if (this.position === 'top') {
			x = this.el.nativeElement.getBoundingClientRect().left + this.el.nativeElement.offsetWidth / 2;
			y = this.el.nativeElement.getBoundingClientRect().top - this.el.nativeElement.offsetHeight - 28;
		} else if (this.position === 'right') {
			x = this.el.nativeElement.getBoundingClientRect().left + this.el.nativeElement.offsetWidth + 3 * this.text.length;
			y = this.el.nativeElement.getBoundingClientRect().top + this.el.nativeElement.offsetHeight / 2 - 13;
		} else if (this.position === 'left') {
			// Todo: Modificar para el lado izquierdo
			x = this.el.nativeElement.getBoundingClientRect().left + this.el.nativeElement.offsetWidth - 3 * this.text.length;
			y = this.el.nativeElement.getBoundingClientRect().top + this.el.nativeElement.offsetHeight / 2 - 13;
		}

		this.createTooltipPopup(x, y);
	}

	@HostListener('mouseleave') onMouseLeave() {
		if (this.myPopup) {
			this.myPopup.remove();
		}
	}

	private createTooltipPopup(x: number, y: number) {
		const popup = document.createElement('p');
		popup.innerHTML = this.text;
		popup.classList.add('tooltip-container');
		popup.classList.add(this.position);
		popup.style.top = y.toString() + 'px';
		popup.style.left = x.toString() + 'px';
		document.body.appendChild(popup);
		this.myPopup = popup;
	}
}
