import { StorylistComponent } from './storylist.component';
import { render, RenderResult } from '@testing-library/angular';
import { CommonModule } from '@angular/common';
import { provideMock } from '@testing-library/angular/jest-utils';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input } from '@angular/core';
import { Storylist } from '@models/storylist.model';
import { StorylistGridSkeletonConfig } from '@models/content.model';

describe('StorylistComponent', () => {
	let componentRender: RenderResult<StorylistComponent, StorylistComponent>;

	beforeEach(async () => {
		componentRender = await render(StorylistComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				MockStorylistCardDeckComponent,
				NgxSkeletonLoaderModule,
				RouterTestingModule,
			],
			componentProviders: [provideMock(FetchContentDirective), provideMock(MetaTagsDirective)],
		});
	});

	it('should create', () => {
		expect(componentRender).toBeTruthy();
	});
});

@Component({
	standalone: true,
	selector: 'cuentoneta-storylist-card-deck:not(p)',
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
