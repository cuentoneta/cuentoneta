import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { authorMock } from '@mocks/author.mock';
import { type AuthorProfile } from '@models/author.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '../../utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AuthorMetaTagsDirective } from './author-meta-tags.directive';
import { AUTHOR_HOST } from './author-host';

describe('AuthorMetaTagsDirective', () => {
	const authorSignal = signal<AuthorProfile | undefined>(undefined);
	const slugSignal = signal('jorge-luis-borges');

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new AuthorMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		authorSignal.set(undefined);
		slugSignal.set('jorge-luis-borges');
		TestBed.configureTestingModule({
			providers: [
				AuthorMetaTagsDirective,
				HeadMetadataDirective,
				{ provide: AUTHOR_HOST, useValue: { author: authorSignal.asReadonly(), slug: slugSignal.asReadonly() } },
			],
		});
	});

	it('should not set meta tags while the author is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the canonical URL from the slug even when the author has not resolved yet', () => {
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.Author}/jorge-luis-borges`));
	});

	it('should set the title from the author name when it resolves', () => {
		authorSignal.set(authorMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(authorMock.name));
	});

	it('should re-apply the meta tags when the author signal changes', () => {
		authorSignal.set(authorMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		authorSignal.set({ ...authorMock, name: 'Otra Autora' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining('Otra Autora'));
	});
});
