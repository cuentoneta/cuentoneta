import { StoryComponent } from './story.component';
import { render, RenderResult } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryNavigationBarComponent } from '../../components/story-navigation-bar/story-navigation-bar.component';
import { BioSummaryCardComponent } from '../../components/bio-summary-card/bio-summary-card.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { Storylist } from '@models/storylist.model';
import { Story } from '@models/story.model';

describe('StoryComponent', () => {
  let component: RenderResult<StoryComponent, StoryComponent>;

  beforeEach(async () => {
    component = await render(StoryComponent, {
      componentImports: [
        CommonModule,
        HttpClientTestingModule,
        NgForOf,
        NgIf,
        NgOptimizedImage,
        NgxSkeletonLoaderModule,
        MockBioSummaryCardComponent,
        MockShareContentComponent,
        MockStoryNavigationBarComponent
      ],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  standalone: true,
  selector: 'cuentoneta-share-content:not(p)',
  template: '',
})
class MockShareContentComponent {
  @Input() route: string = '';
  @Input() params: { [key: string]: string } = {};
  @Input() message: string = '';
  @Input() isLoading: boolean = false;}

@Component({
  standalone: true,
  selector: 'cuentoneta-bio-summary-card:not(p)',
  template: '',
})
class MockBioSummaryCardComponent {
  @Input({required: true}) story!: Story;
}

@Component({
  standalone: true,
  selector: 'cuentoneta-story-navigation-bar:not(p)',
  template: '',
})
class MockStoryNavigationBarComponent {
  @Input() selectedStorySlug: string = ''
  @Input() storylist!: Storylist

}
