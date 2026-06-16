import HomeComponent from './home.component';
import { render } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideContentApiMock } from '../../providers/content.mock';
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
			providers: [provideRouter([]), provideContentApiMock()],
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
	public readonly storylist = input<Storylist>();
	public readonly isLoading = input<boolean>(false);
}
