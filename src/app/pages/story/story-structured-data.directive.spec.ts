import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';

import { storyMock } from '@mocks/story.mock';
import { type Story } from '@models/story.model';
import { StoryStructuredDataDirective } from './story-structured-data.directive';
import { STORY_HOST } from './story-host';

describe('StoryStructuredDataDirective', () => {
	const storySignal = signal<Story | undefined>(undefined);

	function instantiate(): void {
		TestBed.runInInjectionContext(() => new StoryStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		storySignal.set(undefined);
		TestBed.configureTestingModule({
			providers: [StoryStructuredDataDirective, { provide: STORY_HOST, useValue: { story: storySignal.asReadonly() } }],
		});
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
	});

	it('should not emit JSON-LD while the story is undefined', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelector('script[data-schema-id="article"]')).toBeNull();
	});

	it('should emit the Article and breadcrumb JSON-LD when the story resolves', () => {
		storySignal.set(storyMock);

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(JSON.parse(head.querySelector('script[data-schema-id="article"]')?.textContent ?? '{}')).toMatchObject({
			'@type': 'Article',
		});
		expect(
			JSON.parse(head.querySelector('script[data-schema-id="breadcrumb-story"]')?.textContent ?? '{}'),
		).toMatchObject({ '@type': 'BreadcrumbList' });
	});

	it('should remove both JSON-LD blocks when destroyed', () => {
		storySignal.set(storyMock);
		instantiate();
		TestBed.tick();
		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="article"]')).not.toBeNull();

		TestBed.resetTestingModule();

		expect(head.querySelector('script[data-schema-id="article"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-story"]')).toBeNull();
	});
});
