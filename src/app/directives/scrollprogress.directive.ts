import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[cuentonetaAppScrollprogress]',
  standalone: true,
})
export class ScrollprogressDirective {
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    const target = event.currentTarget as Element;
    if (target) {
      const winScroll = target.scrollTop;
      const height = target.scrollHeight - target.clientHeight;
      const scrolled = (winScroll / height) * 100;

      console.log('Scroll %', scrolled);

      const scrollBar = document.getElementById(
        'scrollBar'
      ) as HTMLElement | null;
      if (scrollBar) {
        scrollBar.style.width = `${scrolled}%`;
      }
    }
  }
}
