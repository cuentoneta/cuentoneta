// Core
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

// 3rd party modules
import { render, RenderResult } from '@testing-library/angular';
import { provideMock } from '@testing-library/angular/jest-utils';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { Storylist } from '@models/storylist.model';
import { StorylistGridSkeletonConfig } from '@models/content.model';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import { StorylistComponent } from './storylist.component';

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
	number = input(6);
	storyList = input<Storylist>();
	isLoading = input(false);
	canNavigateToStorylist = input(false);
	displayTitle = input(true);
	displayFeaturedImage = input(false);
	skeletonConfig = input<StorylistGridSkeletonConfig>();
}
