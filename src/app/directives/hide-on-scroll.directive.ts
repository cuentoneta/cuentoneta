import {
	Directive,
	ElementRef,
	AfterViewInit,
	Inject,
	PLATFORM_ID,
	OnDestroy,
	Input,
	Renderer2,
	Output,
	EventEmitter,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, share, takeUntil, throttleTime } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';

@Directive({
	selector: '[cuentonetaHideOnScroll]',
})
export class HideOnScrollDirective implements AfterViewInit, OnDestroy {
	/**
	 * `'Down'`: The element will be hidden on scroll down and it will be shown again on scroll up.<br/>`Up`: The element will be hidden on scroll up and it will be shown again on scroll down.
	 */
	@Input() hideOnScroll: 'Down' | 'Up' = 'Down';

	/**
	 * CSS class name added to the element to hide it. When this property is set, `propertyUsedToHide`, `valueWhenHidden`, and `valueWhenShown` have not effect.
	 */
	@Input() classNameWhenHidden: string = '';

	/**
	 * The CSS property used to hide/show the element.
	 *
	 * @default
	 * 'transform'
	 */
	@Input() propertyUsedToHide: 'transform' | 'top' | 'bottom' | 'height' = 'transform';

	/**
	 * The value of `propertyUsedToHide` when the element is hidden.
	 *
	 * @default
	 * 'translateY(-100%)'
	 */
	@Input() valueWhenHidden: string = 'translateY(-100%)';

	/**
	 * The value of `propertyUsedToHide` when the element is shown.
	 *
	 * @default
	 * 'translateY(0)'
	 */
	@Input() valueWhenShown: string = 'translateY(0)';

	/**
	 * The selector of the element you want to listen the scroll event, in case it is not the default browser scrolling element (`document.scrollingElement` or `document.documentElement`). For example [` .mat-sidenav-content`]( https://stackoverflow.com/a/52931772/12954396) if you are using [Angular Material Sidenav]( https://material.angular.io/components/sidenav)
	 */
	@Input() scrollingElementSelector: string = '';

	/**
	 * Emitted when the element is hidden.
	 */
	@Output() eventElementHidden = new EventEmitter<void>();

	/**
	 * Emitted when the element is shown.
	 */
	@Output() eventElementShown = new EventEmitter<void>();

	private unsubscribeNotifier = new Subject();

	constructor(
		private elementRef: ElementRef<HTMLElement>,
		private renderer2: Renderer2,
		@Inject(PLATFORM_ID) private platformId: string,
	) {}

	ngAfterViewInit(): void {
		if (isPlatformServer(this.platformId)) {
			return;
		}

		let elementToListenScrollEvent;
		let scrollingElement: HTMLElement;
		if (!this.scrollingElementSelector) {
			elementToListenScrollEvent = window;
			scrollingElement = this.getDefaultScrollingElement();
		} else {
			scrollingElement = document.querySelector(this.scrollingElementSelector) as HTMLElement;
			if (!scrollingElement) {
				console.error(
					`NgxHideOnScroll: @Input() scrollingElementSelector\nElement with selector: "${this.scrollingElementSelector}" not found.`,
				);
				return;
			}
			elementToListenScrollEvent = scrollingElement;
		}

		const scroll$ = fromEvent(elementToListenScrollEvent, 'scroll').pipe(
			takeUntil(this.unsubscribeNotifier),
			throttleTime(50), // only emit every 50 ms
			map(() => scrollingElement.scrollTop), // get vertical scroll position
			pairwise(), // look at this and the last emitted element
			// compare this and the last element to figure out scrolling direction
			map(([y1, y2]): ScrollDirection => (y2 < y1 ? ScrollDirection.Up : ScrollDirection.Down)),
			distinctUntilChanged(), // only emit when scrolling direction changed
			share(), // share a single subscription to the underlying sequence in case of multiple subscribers
		);

		const scrollUp$ = scroll$.pipe(filter((direction) => direction === ScrollDirection.Up));

		const scrollDown$ = scroll$.pipe(filter((direction) => direction === ScrollDirection.Down));

		let scrollUpAction: () => void;
		let scrollDownAction: () => void;
		if (this.hideOnScroll === 'Up') {
			scrollUpAction = () => this.hideElement();
			scrollDownAction = () => this.showElement();
		} else {
			scrollUpAction = () => this.showElement();
			scrollDownAction = () => this.hideElement();
		}

		scrollUp$.subscribe(() => scrollUpAction());
		scrollDown$.subscribe(() => scrollDownAction());
	}

	ngOnDestroy(): void {
		// this.unsubscribeNotifier.next();
		this.unsubscribeNotifier.complete();
	}

	private hideElement(): void {
		const nativeElement = this.elementRef.nativeElement;
		if (this.classNameWhenHidden) {
			this.renderer2.addClass(nativeElement, this.classNameWhenHidden);
		} else {
			this.renderer2.setStyle(nativeElement, this.propertyUsedToHide, this.valueWhenHidden);
		}
		this.eventElementHidden.emit();
	}

	private showElement(): void {
		const nativeElement = this.elementRef.nativeElement;
		if (this.classNameWhenHidden) {
			this.renderer2.removeClass(nativeElement, this.classNameWhenHidden);
		} else {
			this.renderer2.setStyle(nativeElement, this.propertyUsedToHide, this.valueWhenShown);
		}
		this.eventElementShown.emit();
	}

	private getDefaultScrollingElement(): HTMLElement {
		return (document.scrollingElement || document.documentElement) as HTMLElement;
	}
}

enum ScrollDirection {
	Up = 'Up',
	Down = 'Down',
}
