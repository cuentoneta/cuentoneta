import HomeComponent from './home.component';
import { render } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from '../../providers/content.service';
import { Component, input } from '@angular/core';
import { Storylist } from '@models/storylist.model';

describe.skip('HomeComponent', () => {
	const setup = async () => {
		return await render(HomeComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				NgForOf,
				NgIf,
				NgOptimizedImage,
				MockStorylistCardDeckComponent,
			],
			componentProviders: [provideRouter([]), { provide: ContentService, useClass: provideMock(ContentService) }],
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

@Component({
	standalone: true,
	selector: 'cuentoneta-storylist-card-deck:not(p)',
	imports: [],
	template: '',
})
class MockStorylistCardDeckComponent {
	readonly storylist = input<Storylist>();
	readonly isLoading = input<boolean>(false);
}
