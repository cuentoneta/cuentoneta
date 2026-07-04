import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { storylistMock } from '@mocks/storylist.mock';
import { type Storylist } from '@models/storylist.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '../../utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { StorylistMetaTagsDirective } from './storylist-meta-tags.directive';
import { STORYLIST_HOST } from './storylist-host';

describe('StorylistMetaTagsDirective', () => {
	const storylistSignal = signal<Storylist | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new StorylistMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		storylistSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				StorylistMetaTagsDirective,
				HeadMetadataDirective,
				{
					provide: STORYLIST_HOST,
					useValue: { storylist: storylistSignal.asReadonly() },
				},
			],
		});
	});

	it('should not set meta tags while the storylist is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the canonical URL from the storylist slug when it resolves', () => {
		storylistSignal.set(storylistMock);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.StoryList}/${storylistMock.slug}`));
	});

	it('should set the title from the storylist when it resolves', () => {
		storylistSignal.set(storylistMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(storylistMock.title));
	});

	it('should re-apply the meta tags when the storylist signal changes', () => {
		storylistSignal.set(storylistMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		storylistSignal.set({ ...storylistMock, title: 'Otra colección' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining('Otra colección'));
	});
});
