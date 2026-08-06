import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Collection, CollectionTeaser } from '@models/collection.model';

// El listado devuelve teasers: la vista de catálogo muestra cada colección sin sus obras.
export interface CollectionApi {
	getBySlug(slug: string): Observable<Collection>;
	getAll(): Observable<CollectionTeaser[]>;
}

export const CollectionApi = new InjectionToken<CollectionApi>('CollectionApi');
