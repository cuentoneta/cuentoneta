import {
  Directive,
  HostListener,
  Renderer2,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';

@Directive({
  selector: '[cuentonetaAppScrollprogress]',
  standalone: true,
})
export class ScrollprogressDirective {
  renderer = inject(Renderer2);

  @ViewChild('scrollBar')
  scrollBarRef!: ElementRef<HTMLElement>;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    const target = event.currentTarget as Element;
    if (target) {
      const winScroll = target.scrollTop;
      const height = target.scrollHeight - target.clientHeight;
      const scrolled = (winScroll / height) * 100;

      console.log('Scroll %', scrolled);

      this.renderer.setStyle(
        this.scrollBarRef.nativeElement,
        'width',
        `${scrolled}%`
      );
    }
  }
}
