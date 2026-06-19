// Core
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// 3rd party modules
import { render } from '@testing-library/angular';
import { provideMock } from '@testing-library/angular/jest-utils';

// Models
import { Storylist } from '@models/storylist.model';

// Directives
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';

// Componentes
import StorylistComponent from './storylist.component';

describe.skip('StorylistComponent', () => {
	const setup = async () => {
		return await render(StorylistComponent, {
			componentImports: [CommonModule, HttpClientTestingModule, MockStorylistCardDeckComponent],
			componentProviders: [provideRouter([]), provideMock(HeadMetadataDirective)],
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
	public readonly storyList = input<Storylist>();
	public readonly isLoading = input(false);
}
