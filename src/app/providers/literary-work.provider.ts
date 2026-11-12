// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import {
	createLiteraryWork,
	LiteraryWorkListingView,
	type LiteraryWork,
	type LiteraryWorkCatalogEntry,
} from '@models/literary-work.model';
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import {
	literaryWorkCatalogListDtoSchema,
	literaryWorkDtoSchema,
	literaryWorkTeaserListDtoSchema,
	toLiteraryWorkCatalogEntry,
	toLiteraryWorkTeaser,
	type LiteraryWorkCatalogEntryDto,
	type LiteraryWorkDto,
	type LiteraryWorkTeaserDto,
	type LiteraryWorkSectionDto,
} from '@models/literary-work.dto';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { ApiUrl } from './endpoints';
import { Endpoints } from './endpoints';

// Espeja el contrato del endpoint: el filtrado del catálogo va por query params, así que acá es un
// registro de campos opcionales — un criterio nuevo suma un campo, no un método.
export interface LiteraryWorkTeaserFilter {
	readonly author?: string;
}

export interface LiteraryWorkApi {
	getBySlug(slug: string): Observable<LiteraryWork>;
	getTeasers(filter?: LiteraryWorkTeaserFilter): Observable<LiteraryWorkTeaser[]>;
	getCatalog(filter?: LiteraryWorkTeaserFilter): Observable<LiteraryWorkCatalogEntry[]>;
}

@Service()
export class HttpLiteraryWorkApi implements LiteraryWorkApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.LiteraryWork}`;
	private readonly http = inject(HttpClient);

	public getBySlug(slug: string): Observable<LiteraryWork> {
		return this.http
			.get<LiteraryWorkDto>(`${this.url}/${slug}`)
			.pipe(map((response) => this.toLiteraryWork(literaryWorkDtoSchema.parse(response))));
	}

	// El listado sin `view` responde el catálogo, que no trae extracto: la vista de tarjeta se pide explícita.
	public getTeasers(filter: LiteraryWorkTeaserFilter = {}): Observable<LiteraryWorkTeaser[]> {
		return this.http
			.get<LiteraryWorkTeaserDto[]>(this.url, {
				params: { ...this.toParams(filter), view: LiteraryWorkListingView.Teaser },
			})
			.pipe(map((response) => literaryWorkTeaserListDtoSchema.parse(response).map(toLiteraryWorkTeaser)));
	}

	public getCatalog(filter: LiteraryWorkTeaserFilter = {}): Observable<LiteraryWorkCatalogEntry[]> {
		return this.http
			.get<LiteraryWorkCatalogEntryDto[]>(this.url, { params: this.toParams(filter) })
			.pipe(map((response) => literaryWorkCatalogListDtoSchema.parse(response).map(toLiteraryWorkCatalogEntry)));
	}

	private toParams(filter: LiteraryWorkTeaserFilter): Record<string, string> {
		return filter.author ? { author: filter.author } : {};
	}

	private toSection(dto: LiteraryWorkSectionDto): LiteraryWorkSection {
		return createLiteraryWorkSection({
			position: dto.position,
			title: dto.title ? createSectionTitle(dto.title.value) : undefined,
			epigraphs: dto.epigraphs?.map((epigraph) =>
				createAttributedText({
					text: createSanitizedHtml(epigraph.text),
					reference: epigraph.reference ? createSanitizedHtml(epigraph.reference) : undefined,
				}),
			),
			bodyHtml: createSanitizedHtml(dto.bodyHtml),
			readingTime: createReadingTime(dto.readingTime),
		});
	}

	// ACL del frontend, simétrico al mapper de Sanity del backend: dto → dominio vía las mismas
	// factories, así datos inválidos lanzan acá y no en un template. totalReadingTime y sectionCount
	// no se forwardean: createLiteraryWork los deriva de las secciones, no son options.
	private toLiteraryWork(dto: LiteraryWorkDto): LiteraryWork {
		return createLiteraryWork({
			_id: dto._id,
			slug: dto.slug,
			title: dto.title,
			authors: dto.authors,
			coverImage: dto.coverImage,
			content: dto.content.map(this.toSection),
			// El DTO transporta los medios como objeto de dominio opaco, así que su descripción cruza el
			// wire sin que el schema Zod la valide. Se rehidrata por la misma factory que el cuerpo y los
			// epígrafes, para que la garantía de `SanitizedHtml` sea la misma en toda la superficie.
			mediaSources: dto.mediaSources.map((media) => ({
				...media,
				description: createSanitizedHtml(media.description),
			})),
			resources: dto.resources,
			badLanguage: dto.badLanguage,
			tags: dto.tags,
			originalPublication: dto.originalPublication,
			publishedAt: createIsoDateTime(dto.publishedAt),
			editorialNote: dto.editorialNote ? createSanitizedHtml(dto.editorialNote) : undefined,
		});
	}
}

export const LiteraryWorkApi = new InjectionToken<LiteraryWorkApi>('LiteraryWorkApi', {
	providedIn: 'root',
	factory: () => inject(HttpLiteraryWorkApi),
});
