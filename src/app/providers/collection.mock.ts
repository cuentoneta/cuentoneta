// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import type { Collection, CollectionTeaser } from '@models/collection.model';
import { CollectionApi } from './collection-api.interface';

// Devuelve canned: la búsqueda por slug resuelve contra las colecciones cargadas y los teasers salen
// de esas mismas, para que las tres respuestas no puedan contradecirse entre sí.
export class StubCollectionApi implements CollectionApi {
	constructor(private readonly collections: readonly Collection[]) {}

	public getBySlug(slug: string): Observable<Collection> {
		const collection = this.collections.find((candidate) => candidate.slug === slug) ?? this.collections[0];
		if (!collection) {
			throw new Error('StubCollectionApi: sin colecciones cargadas');
		}
		return of(collection);
	}

	public getAll(): Observable<Collection[]> {
		return of([...this.collections]);
	}

	public getTeasers(): Observable<CollectionTeaser[]> {
		return of(this.collections.map((collection) => ({ ...collection, literaryWorks: [] })));
	}
}

export function provideCollectionApiMock(api: CollectionApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: CollectionApi, useValue: api }]);
}
