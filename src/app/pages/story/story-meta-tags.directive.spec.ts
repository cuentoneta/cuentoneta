import { clearAllMocks, spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { storyMock } from '@mocks/story.mock';
import { type Story } from '@models/story.model';
import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '../../utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { StoryMetaTagsDirective } from './story-meta-tags.directive';
import { STORY_HOST } from './story-host';

describe('StoryMetaTagsDirective', () => {
	const storySignal = signal<Story | undefined>(undefined);
	const slugSignal = signal('el-aleph');

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new StoryMetaTagsDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		storySignal.set(undefined);
		slugSignal.set('el-aleph');
		TestBed.configureTestingModule({
			providers: [
				StoryMetaTagsDirective,
				HeadMetadataDirective,
				{ provide: STORY_HOST, useValue: { story: storySignal.asReadonly(), slug: slugSignal.asReadonly() } },
			],
		});
	});

	it('should not set meta tags while the story is undefined', () => {
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).not.toHaveBeenCalled();
	});

	it('should set the canonical URL from the slug even when the story has not resolved yet', () => {
		const canonicalSpy = spyOn(TestBed.inject(HeadMetadataDirective), 'setCanonicalUrl');

		instantiate();
		TestBed.tick();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(`${AppRoutes.Story}/el-aleph`));
	});

	it('should set the title from the story when it resolves', () => {
		storySignal.set(storyMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');

		instantiate();
		TestBed.tick();

		expect(titleSpy).toHaveBeenCalledWith(expect.stringContaining(`${storyMock.title} - ${storyMock.author.name}`));
	});

	it('should re-apply the meta tags when the story signal changes', () => {
		storySignal.set(storyMock);
		const titleSpy = spyOn(TestBed.inject(Title), 'setTitle');
		instantiate();
		TestBed.tick();

		storySignal.set({ ...storyMock, title: 'Otro título' });
		TestBed.tick();

		expect(titleSpy).toHaveBeenLastCalledWith(expect.stringContaining(`Otro título - ${storyMock.author.name}`));
	});
});
