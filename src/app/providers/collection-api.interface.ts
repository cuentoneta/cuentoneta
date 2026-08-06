import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Collection, CollectionTeaser } from '@models/collection.model';

export interface CollectionApi {
	getBySlug(slug: string): Observable<Collection>;
	getAll(): Observable<Collection[]>;
	getTeasers(): Observable<CollectionTeaser[]>;
}

export const CollectionApi = new InjectionToken<CollectionApi>('CollectionApi');
