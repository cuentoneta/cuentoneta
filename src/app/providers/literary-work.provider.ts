// Core
import { inject, InjectionToken, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createAttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import {
	literaryWorkDtoSchema,
	literaryWorkTeaserListDtoSchema,
	toLiteraryWorkTeaser,
	type LiteraryWorkDto,
	type LiteraryWorkTeaserDto,
	type LiteraryWorkSectionDto,
} from '@models/literary-work.dto';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { readingSuggestionsDtoSchema, type ReadingSuggestionsDto } from '@models/reading-suggestions.dto';
import type { ReadingSuggestions, ReadingSuggestionsScope } from '@models/reading-suggestions.model';
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
	getSuggestions(workSlug: string, scope: ReadingSuggestionsScope): Observable<ReadingSuggestions>;
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

	public getTeasers(filter: LiteraryWorkTeaserFilter = {}): Observable<LiteraryWorkTeaser[]> {
		return this.http
			.get<LiteraryWorkTeaserDto[]>(this.url, { params: filter.author ? { author: filter.author } : {} })
			.pipe(map((response) => literaryWorkTeaserListDtoSchema.parse(response).map(toLiteraryWorkTeaser)));
	}

	// El bloque de sugerencias al pie de una obra: cuáles son y cuántas las decide el backend, así que acá
	// solo se transporta el ámbito y la obra que se lee, y se rehidrata lo que vuelve. La obra viaja en el
	// path porque es la referencia del recorte: el backend la descarta y mide afinidad contra sus tags.
	public getSuggestions(workSlug: string, scope: ReadingSuggestionsScope): Observable<ReadingSuggestions> {
		return this.http
			.get<unknown>(`${this.url}/${workSlug}/suggestions`, { params: { ...scope } })
			.pipe(map((response) => this.toReadingSuggestions(readingSuggestionsDtoSchema.parse(response))));
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

	// Las obras del bloque las rehidrata el mismo mapper que el catálogo: son la misma vista de teaser,
	// y el encabezado es texto plano del ámbito.
	private toReadingSuggestions(dto: ReadingSuggestionsDto): ReadingSuggestions {
		return { title: dto.title, suggestions: dto.suggestions.map(toLiteraryWorkTeaser) };
	}
}

export const LiteraryWorkApi = new InjectionToken<LiteraryWorkApi>('LiteraryWorkApi', {
	providedIn: 'root',
	factory: () => inject(HttpLiteraryWorkApi),
});
