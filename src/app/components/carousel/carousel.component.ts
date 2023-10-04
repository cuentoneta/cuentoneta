import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { Publication, Storylist } from '@models/storylist.model';
import { Story } from '@models/story.model';
import { APP_ROUTE_TREE } from 'src/app/app.routes';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { StoryNavigationBarComponent } from '../story-navigation-bar/story-navigation-bar.component';

@Component({
  selector: 'cuentoneta-carousel',
  standalone: true,
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    NgIf,
    NgFor,
    RouterLink,
    StoryEditionDateLabelComponent,
    StoryNavigationBarComponent,
  ],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnChanges {
  @Input() displayedPublications: Publication<Story>[] = [];
  @Input() selectedStorySlug: string = '';
  @Input() storylist!: Storylist;

  @ViewChild('prevButton') prevButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('nextButton') nextButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('slider') slider!: ElementRef<HTMLDivElement>;
  @ViewChild('sliderInner') sliderInner!: ElementRef<HTMLDivElement>;

  readonly appRouteTree = APP_ROUTE_TREE;
  dummyList: null[] = Array(10);

  private renderer = inject(Renderer2);

  elementsInView: number = 10;
  childrenHeight!: number;
  childrenLength!: number;
  totalHeight!: number;

  index!: number;

  indexLength!: number;
  totalHeightElementsInView!: number;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['storylist']) {
      this.loadCarousel();
    }
  }

  // Anteriores elementos
  prev() {
    if (this.index <= this.totalHeightElementsInView) {
      this.index = 0;
      this.setButtonDisplay(this.prevButton, 'none');
      this.setButtonDisplay(this.nextButton, 'block');
    } else {
      this.index -= this.childrenHeight * this.elementsInView;
      this.setButtonDisplay(this.nextButton, 'block');
    }
    this.renderer.setStyle(
      this.sliderInner.nativeElement,
      'transform',
      `translateY(-${this.index}px)`
    );
  }

  // Siguientes elementos
  next() {
    this.index = this.getSelectedStoryIndex(this.storylist.publications);

    if (
      this.index + this.childrenHeight * this.elementsInView >=
      this.totalHeight - this.totalHeightElementsInView
    ) {
      this.index = this.indexLength;
      this.setButtonDisplay(this.nextButton, 'none');
      this.setButtonDisplay(this.prevButton, 'block');
    } else {
      this.index += this.childrenHeight * this.elementsInView;
      this.setButtonDisplay(this.prevButton, 'block');
    }
    this.renderer.setStyle(
      this.sliderInner.nativeElement,
      'transform',
      `translateY(-${this.index}px)`
    );
  }

  // ToDo: Separar card de cada cuento de la lista en su propio componente, para evitar usar un método en el template
  getEditionLabel(
    publication: Publication<Story>,
    editionIndex: number = 0
  ): string {
    return `${this.storylist?.editionPrefix} ${editionIndex} ${
      this.storylist.displayDates ? ' - ' + publication.publishingDate : ''
    }`;
  }

  /**
   * Obtiene el índice de la historia actualimente visualizada en la lista.
   * @param publications
   * @private
   */
  private getSelectedStoryIndex(publications: Publication<Story>[]): number {
    return publications.findIndex(
      (publication) => publication.story.slug === this.selectedStorySlug
    );
  }

  /**
   * Utilizado para cambiar el valor del atributo display en los botones anteriores y siguientes de la navbar.
   * @param element
   * @param displayValue
   * @private
   */
  private setButtonDisplay(element: ElementRef, displayValue: string) {
    this.renderer.setStyle(element.nativeElement, 'display', displayValue);
  }

  /**
   * Inicializa el carrusel y se encarga de renderizar, si corresponde, los botones para visualizar las historias anteriores y siguientes.
   * @private
   */
  private loadCarousel() {
    if (!this.sliderInner) {
      return;
    }
    const sliderRootElement = this.sliderInner.nativeElement;

    this.childrenHeight = Math.max(
        ...Array.from(sliderRootElement.children).map(
            (child) => (child as HTMLElement).offsetHeight
        )
    ) + 2;

    this.childrenLength = this.storylist.publications.length;
    this.totalHeight =
      this.childrenHeight * sliderRootElement.childElementCount;

    this.renderer.setStyle(
      this.slider.nativeElement,
      'height',
      `${this.childrenHeight * this.elementsInView}px`
    );

    this.index = 0;
    this.indexLength =
      this.childrenHeight * (this.childrenLength - this.elementsInView);
    this.totalHeightElementsInView = this.elementsInView * this.childrenHeight;

    // Si hay menos elementos que en elementsInView no aparecen los botones.
    if (this.childrenLength <= this.elementsInView) {
      this.setButtonDisplay(this.prevButton, 'none');
      this.setButtonDisplay(this.nextButton, 'none');
    } else {
      this.setButtonDisplay(this.prevButton, 'none');
    }
  }
}
