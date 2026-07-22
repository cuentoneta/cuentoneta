import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Author } from '@models/author.model';
import type { LiteraryWork } from '@models/literary-work.model';
import type { Media } from '@models/media.model';
import type { Resource } from '@models/resource.model';
import type { Tag } from '@models/tag.model';

// Shape de wire del agregado serializado (LITERARY_WORK_DESIGN.md §7): los brands compile-time
// y los métodos no cruzan JSON — ChapterTitle llega como { value } sin toAnchor(). Author/Tag/
// Resource/Media no están brandeados, se reusan tal cual. El DTO no sale del provider.
export interface LiteraryWorkEpigraphDto {
	readonly text: string;
	readonly reference?: string;
}

export interface LiteraryWorkSectionDto {
	readonly position: number;
	readonly chapterTitle?: { readonly value: string };
	readonly epigraphs?: readonly LiteraryWorkEpigraphDto[];
	readonly bodyHtml: string;
	readonly readingTime: number;
}

export interface LiteraryWorkDto {
	readonly _id: string;
	readonly slug: string;
	readonly title: string;
	readonly coverImage: string;
	readonly totalReadingTime: number;
	readonly sectionCount: number;
	readonly tags: readonly Tag[];
	readonly authors: readonly Author[];
	readonly content: readonly LiteraryWorkSectionDto[];
	readonly mediaSources: readonly Media[];
	readonly resources: readonly Resource[];
	readonly badLanguage?: boolean;
	readonly originalPublication: string;
	readonly publishedAt: string;
}

export interface LiteraryWorkApi {
	getBySlug(slug: string): Observable<LiteraryWork>;
}

export const LiteraryWorkApi = new InjectionToken<LiteraryWorkApi>('LiteraryWorkApi');
