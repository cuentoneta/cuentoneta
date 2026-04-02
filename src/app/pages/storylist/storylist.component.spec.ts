// Core
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// 3rd party modules
import { render } from '@testing-library/angular';
import { provideMock } from '@testing-library/angular/jest-utils';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { Storylist } from '@models/storylist.model';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import StorylistComponent from './storylist.component';

xdescribe('StorylistComponent', () => {
	const setup = async () => {
		return await render(StorylistComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				MockStorylistCardDeckComponent,
				NgxSkeletonLoaderModule,
			],
			componentProviders: [provideRouter([]), provideMock(MetaTagsDirective)],
		});
	};

	it('should create', () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

@Component({
	standalone: true,
	selector: 'cuentoneta-storylist-card-deck:not(p)',
	template: '',
})
class MockStorylistCardDeckComponent {
	readonly storyList = input<Storylist>();
	readonly isLoading = input(false);
}
