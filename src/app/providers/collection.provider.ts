// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import {
	createCollection,
	createCollectionTeaser,
	type Collection,
	type CollectionTeaser,
} from '@models/collection.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { collectionDtoSchema, collectionTeaserListDtoSchema, type CollectionDto } from '@models/collection.dto';
import { toLiteraryWorkTeaser } from '@models/literary-work.dto';
import type { ApiUrl } from './endpoints';
import { Endpoints } from './endpoints';

// El listado devuelve teasers: la vista de catálogo muestra cada colección sin sus obras.
export interface CollectionApi {
	getBySlug(slug: string): Observable<Collection>;
	getAll(): Observable<CollectionTeaser[]>;
}

@Service()
export class HttpCollectionApi implements CollectionApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Collection}`;
	private readonly http = inject(HttpClient);

	public getBySlug(slug: string): Observable<Collection> {
		return this.http
			.get<unknown>(`${this.url}/${slug}`)
			.pipe(map((response) => this.toCollection(collectionDtoSchema.parse(response))));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return this.http
			.get<unknown>(this.url)
			.pipe(
				map((response) =>
					collectionTeaserListDtoSchema
						.parse(response)
						.map((dto) => createCollectionTeaser({ ...dto, description: createSanitizedHtml(dto.description) })),
				),
			);
	}

	// ACL del frontend, simétrico al del backend: dto → dominio por las mismas factories, así un dato
	// inválido lanza acá y no en un template. `count` no se forwardea: la factory lo deriva.
	private toCollection(dto: CollectionDto): Collection {
		return createCollection({
			...dto,
			description: createSanitizedHtml(dto.description),
			literaryWorks: dto.literaryWorks.map(toLiteraryWorkTeaser),
		});
	}
}

export const CollectionApi = new InjectionToken<CollectionApi>('CollectionApi', {
	providedIn: 'root',
	factory: () => inject(HttpCollectionApi),
});
