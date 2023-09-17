import { HomeComponent } from './home.component';
import { render, RenderResult } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { StorylistCardDeckComponent } from '../../components/storylist-card-deck/storylist-card-deck.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from '../../providers/content.service';
import { FetchContentDirective } from '../../directives/fetch-content.directive';

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
        StoryCardComponent,
        StorylistCardDeckComponent,
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
