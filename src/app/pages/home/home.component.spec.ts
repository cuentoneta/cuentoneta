import HomeComponent from './home.component';
import { render } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from '../../providers/content.service';
import { Component, input } from '@angular/core';
import { Publication, Storylist } from '@models/storylist.model';

xdescribe('HomeComponent', () => {
	const setup = async () => {
		return await render(HomeComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				NgForOf,
				NgIf,
				NgOptimizedImage,
				MockPublicationCardComponent,
				MockStorylistCardDeckComponent,
				RouterTestingModule,
			],
			componentProviders: [{ provide: ContentService, useClass: provideMock(ContentService) }],
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

@Component({
	standalone: true,
	selector: 'cuentoneta-publication-card:not(p):not(a)',
	template: '<div></div>',
})
class MockPublicationCardComponent {
	readonly editionPrefix = input<string>();
	readonly editionSuffix = input<string>();
	readonly comingNextLabel = input<string>();
	readonly displayDate = input<boolean>(false);
	readonly publication = input<Publication>();
	readonly editionIndex = input<number>(0);
}

@Component({
	standalone: true,
	selector: 'cuentoneta-storylist-card-deck:not(p)',
	imports: [MockPublicationCardComponent],
	template: '',
})
class MockStorylistCardDeckComponent {
	readonly storylist = input<Storylist>();
	readonly isLoading = input<boolean>(false);
}
