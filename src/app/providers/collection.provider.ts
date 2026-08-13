// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
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
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createSectionTitle } from '@models/section-title.model';
import { createSlug } from '@models/slug.model';
import { collectionDtoSchema, collectionTeaserDtoSchema, type CollectionDto } from '@models/collection.dto';
import type { LiteraryWorkTeaserDto } from '@models/literary-work.dto';
import { ApiUrl, Endpoints } from './endpoints';
import { CollectionApi } from './collection-api.interface';

@Injectable({ providedIn: 'root' })
export class HttpCollectionApi implements CollectionApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.Collection}`;
	private readonly http = inject(HttpClient);

	public getBySlug(slug: string): Observable<Collection> {
		return this.http
			.get<unknown>(`${this.url}/${slug}`)
			.pipe(map((response) => this.toCollection(collectionDtoSchema.parse(response))));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return this.http.get<unknown>(this.url).pipe(
			map((response) =>
				collectionTeaserDtoSchema
					.array()
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
			literaryWorks: dto.literaryWorks.map((work) => this.toLiteraryWorkTeaser(work)),
		});
	}

	private toLiteraryWorkTeaser(dto: LiteraryWorkTeaserDto): LiteraryWorkTeaser {
		return {
			...dto,
			slug: createSlug(dto.slug),
			totalReadingTime: createReadingTime(dto.totalReadingTime),
			// Los medios transportan su descripción como HTML ya saneado, pero el schema la ve como un
			// objeto opaco: se rehidrata por la misma factory que el cuerpo, para que la garantía sea la
			// misma en toda la superficie.
			mediaSources: dto.mediaSources.map((media) => ({
				...media,
				description: createSanitizedHtml(media.description),
			})),
			teaserSection: createLiteraryWorkSection({
				position: dto.teaserSection.position,
				title: dto.teaserSection.title ? createSectionTitle(dto.teaserSection.title.value) : undefined,
				epigraphs: dto.teaserSection.epigraphs?.map((epigraph) =>
					createAttributedText({
						text: createSanitizedHtml(epigraph.text),
						reference: epigraph.reference ? createSanitizedHtml(epigraph.reference) : undefined,
					}),
				),
				bodyHtml: createSanitizedHtml(dto.teaserSection.bodyHtml),
				readingTime: createReadingTime(dto.teaserSection.readingTime),
			}),
		};
	}
}

export function provideCollectionApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: CollectionApi, useExisting: HttpCollectionApi }]);
}
