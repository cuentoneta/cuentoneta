import { HomeComponent } from './home.component';
import { render, RenderResult } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from '../../providers/content.service';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { Component, Input } from '@angular/core';
import { Publication, Storylist } from '@models/storylist.model';
import { StorylistGridSkeletonConfig } from '@models/content.model';
import { Story } from '@models/story.model';

describe('HomeComponent', () => {
  let componentRender: RenderResult<HomeComponent, HomeComponent>;

  beforeEach(async () => {
    componentRender = await render(HomeComponent, {
      componentImports: [
        CommonModule,
        HttpClientTestingModule,
        NgForOf,
        NgIf,
        NgOptimizedImage,
        MockStoryCardComponent,
        MockStorylistCardDeckComponent,
        RouterTestingModule,
      ],
      componentProviders: [
        { provide: ContentService, useClass: provideMock(ContentService) },
        { provide: FetchContentDirective, useClass: provideMock(FetchContentDirective) },
      ],
    });
  });

  it('should create', () => {
    expect(componentRender).toBeTruthy();
  });
});



@Component({
  standalone: true,
  selector: 'cuentoneta-story-card:not(p):not(a)',
  template: '<div></div>',
})
class MockStoryCardComponent {
  @Input() editionPrefix: string | undefined;
  @Input() editionSuffix: string | undefined;
  @Input() comingNextLabel: string = '';
  @Input() displayDate: boolean = false;
  @Input() publication: Publication<Story> | undefined;
  @Input() editionIndex: number = 0;
}

@Component({
  standalone: true,
  selector: 'cuentoneta-storylist-card-deck:not(p)',
  imports: [MockStoryCardComponent],
  template: '',
})
class MockStorylistCardDeckComponent {
  @Input() number: number = 6;
  @Input() storylist: Storylist | undefined;
  @Input() isLoading: boolean = false;
  @Input() canNavigateToStorylist: boolean = false;
  @Input() displayTitle: boolean = true;
  @Input() displayFeaturedImage: boolean = false;
  @Input() skeletonConfig: StorylistGridSkeletonConfig | undefined;
}
