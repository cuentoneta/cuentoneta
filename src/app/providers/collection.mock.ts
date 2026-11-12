// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';

// Models
import type { Collection, CollectionTeaser } from '@models/collection.model';
import { CollectionApi } from './collection.provider';

// Devuelve canned: la búsqueda por slug resuelve contra las colecciones cargadas y los teasers salen
// del mismo conjunto, para que las dos respuestas no puedan contradecirse entre sí. Un slug fuera del
// conjunto responde el 404 que da el endpoint ante una colección inexistente: el estado de no
// encontrada se alcanza con este mismo doble, y un slug mal armado en un test no se resuelve a otra
// colección sin que nadie lo note.
export class StubCollectionApi implements CollectionApi {
	constructor(private readonly collections: readonly Collection[]) {}

	public getBySlug(slug: string): Observable<Collection> {
		const collection = this.collections.find((candidate) => candidate.slug === slug);
		return collection
			? of(collection)
			: throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return of(this.collections.map((collection) => ({ ...collection, literaryWorks: [] })));
	}
}

export function provideCollectionApiMock(api: CollectionApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: CollectionApi, useValue: api }]);
}
