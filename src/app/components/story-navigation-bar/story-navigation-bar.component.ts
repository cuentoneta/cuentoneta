import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2,
  inject,
} from '@angular/core';
import { Publication, Storylist } from '@models/storylist.model';
import { Story } from '@models/story.model';
import { APP_ROUTE_TREE } from '../../app.routes';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, CommonModule } from '@angular/common';

@Component({
  selector: 'cuentoneta-story-navigation-bar',
  templateUrl: './story-navigation-bar.component.html',
  styleUrls: ['./story-navigation-bar.component.scss'],
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
})
export class StoryNavigationBarComponent implements OnChanges, AfterViewInit {
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
  childrensLenght!: number;
  totalHeight!: number;

  index!: number;

  indexLength!: number;
  totalHeightElementsInView!: number;

  ngAfterViewInit() {
    this.childrenHeight =
      this.renderer.selectRootElement(this.sliderInner.nativeElement)
        .children[0].offsetHeight + 2;
    this.childrensLenght = this.renderer.selectRootElement(
      this.sliderInner.nativeElement
    ).childElementCount;
    this.totalHeight =
      this.childrenHeight *
      this.renderer.selectRootElement(this.sliderInner.nativeElement)
        .childElementCount;

    this.renderer.setStyle(
      this.slider.nativeElement,
      'height',
      `${this.childrenHeight * this.elementsInView}px`
    );

    this.index = 0;
    this.indexLength =
      this.childrenHeight * (this.childrensLenght - this.elementsInView);
    this.totalHeightElementsInView = this.elementsInView * this.childrenHeight;

    // Si hay menos elementos que en elementsInView no aparecen los botones.
    if (this.childrensLenght <= this.elementsInView) {
      this.renderer.setStyle(this.prevButton.nativeElement, 'display', 'none');
      this.renderer.setStyle(this.nextButton.nativeElement, 'display', 'none');
    } else {
      this.renderer.setStyle(this.prevButton.nativeElement, 'display', 'none');
    }
  }

  // Anteriores elemetos
  prev() {
    if (this.index <= this.totalHeightElementsInView) {
      this.index = 0;
      this.renderer.setStyle(this.prevButton.nativeElement, 'display', 'none');
      this.renderer.setStyle(this.nextButton.nativeElement, 'display', 'block');
    } else {
      this.index -= this.childrenHeight * this.elementsInView;
      this.renderer.setStyle(this.nextButton.nativeElement, 'display', 'block');
    }
    this.renderer.setStyle(
      this.sliderInner.nativeElement,
      'transform',
      `translateY(-${this.index}px)`
    );
  }

  // Siguientes elementos
  next() {
    if (
      this.index + this.childrenHeight * this.elementsInView >=
      this.totalHeight - this.totalHeightElementsInView
    ) {
      this.index = this.indexLength;
      this.renderer.setStyle(this.nextButton.nativeElement, 'display', 'none');
      this.renderer.setStyle(this.prevButton.nativeElement, 'display', 'block');
    } else {
      this.index += this.childrenHeight * this.elementsInView;
      this.renderer.setStyle(this.prevButton.nativeElement, 'display', 'block');
    }
    this.renderer.setStyle(
      this.sliderInner.nativeElement,
      'transform',
      `translateY(-${this.index}px)`
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const storylist: Storylist = changes['storylist'].currentValue;
    if (!!storylist) {
      this.sliceDisplayedPublications(storylist.publications);
    }
  }

  /**
   * Este método se encarga de mostrar la lista de publicaciones de la navbar en base a la story actualmente en vista.
   * Si la storylist tiene más de 10 publicaciones, se muestran las 10 publicaciones más cercanas a la story actualmente
   * en vista tomando las 5 publicaciones anteriores y las 5 siguientes en el caso por defecto y ajustando los límites en
   * caso de que la story actualmente en vista sea una de las primeras o de las últimas.
   * @author Ramiro Olivencia <ramiro@olivencia.com.ar>
   */
  sliceDisplayedPublications(publications: Publication<Story>[]): void {
    const numberOfDisplayedPublications = 10;

    if (this.storylist.publications.length <= numberOfDisplayedPublications) {
      this.displayedPublications = this.storylist.publications;
      return;
    }

    const selectedStoryIndex = publications.findIndex(
      (publication) => publication.story.slug === this.selectedStorySlug
    );

    const lowerIndex =
      selectedStoryIndex - numberOfDisplayedPublications / 2 < 0
        ? 0
        : selectedStoryIndex - numberOfDisplayedPublications / 2;
    const upperIndex =
      selectedStoryIndex + numberOfDisplayedPublications / 2 >
      publications.length
        ? publications.length
        : selectedStoryIndex + numberOfDisplayedPublications / 2;

    this.displayedPublications = this.storylist.publications.slice(
      upperIndex === publications.length
        ? publications.length - numberOfDisplayedPublications
        : lowerIndex,
      lowerIndex === 0 ? numberOfDisplayedPublications : upperIndex
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
}
