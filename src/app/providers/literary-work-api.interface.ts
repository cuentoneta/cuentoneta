import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Author } from '@models/author.model';
import type { LiteraryWork } from '@models/literary-work.model';
import type { Media } from '@models/media.model';
import type { Resource } from '@models/resource.model';
import type { Tag } from '@models/tag.model';

export interface LiteraryWorkEpigraphDto {
	readonly text: string;
	readonly reference?: string;
}

export interface LiteraryWorkSectionDto {
	readonly position: number;
	readonly title?: { readonly value: string };
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
