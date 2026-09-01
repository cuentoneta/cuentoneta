import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { onoffCollectionsWithTagsMock } from '@mocks/onoff-collections.mock';
import { type Collection } from '@models/collection.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { CollectionMetaTagsDirective } from './collection-meta-tags.directive';
import { COLLECTION_HOST } from './collection-host';

// Con etiquetas, porque un caso afirma que las keywords las incluyen: sin el predicado, una
// colección sin etiquetas dejaría ese `arrayContaining([])` pasando trivialmente.
const [canon] = onoffCollectionsWithTagsMock;

describe('CollectionMetaTagsDirective', () => {
	const collectionSignal = signal<Collection | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new CollectionMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		collectionSignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [
				CollectionMetaTagsDirective,
				HeadMetadataDirective,
				{ provide: COLLECTION_HOST, useValue: { collection: collectionSignal.asReadonly() } },
			],
		});
	});

	it('should not set meta tags while the collection is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the title from the collection when it resolves', () => {
		collectionSignal.set(canon);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(canon.title));
	});

	it('should set the canonical URL from the collection slug via buildCanonicalUrl', () => {
		collectionSignal.set(canon);
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.Collection}/${canon.slug}`));
	});

	// Es el literal del que depende que el guardrail de indexado exija el combo de directivas, así que
	// se afirma solo y no de arrastre dentro de otro caso.
	it('should declare the page as indexable', () => {
		collectionSignal.set(canon);
		const robotsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setRobots');

		instantiate();
		TestBed.tick();

		expect(robotsSpy).toHaveBeenCalledWith('index, follow');
	});

	it('should include the collection tags in the keywords', () => {
		collectionSignal.set(canon);
		const keywordsSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setKeywords');

		instantiate();
		TestBed.tick();

		expect(keywordsSpy).toHaveBeenCalledWith(expect.arrayContaining(canon.tags.map((tag) => tag.title.toLowerCase())));
	});

	it('should re-apply the meta tags when the collection signal changes', () => {
		collectionSignal.set(canon);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		collectionSignal.set({ ...canon, title: 'Otra colección' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining('Otra colección'));
	});
});
