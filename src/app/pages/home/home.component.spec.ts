import { HomeComponent } from './home.component';
import { render } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMock } from '@testing-library/angular/jest-utils';
import { ContentService } from '../../providers/content.service';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
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
			componentProviders: [
				{ provide: ContentService, useClass: provideMock(ContentService) },
				{ provide: FetchContentDirective, useClass: provideMock(FetchContentDirective) },
			],
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
	editionPrefix = input<string>();
	editionSuffix = input<string>();
	comingNextLabel = input<string>();
	displayDate = input<boolean>(false);
	publication = input<Publication>();
	editionIndex = input<number>(0);
}

@Component({
	standalone: true,
	selector: 'cuentoneta-storylist-card-deck:not(p)',
	imports: [MockPublicationCardComponent],
	template: '',
})
class MockStorylistCardDeckComponent {
	storylist = input<Storylist>();
	isLoading = input<boolean>(false);
}
