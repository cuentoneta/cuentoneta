// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import {
	createLiteraryWorkEpigraph,
	createLiteraryWorkSection,
	type LiteraryWorkSection,
} from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { ApiUrl, Endpoints } from './endpoints';
import { LiteraryWorkApi, type LiteraryWorkDto, type LiteraryWorkSectionDto } from './literary-work-api.interface';

function toSection(dto: LiteraryWorkSectionDto): LiteraryWorkSection {
	return createLiteraryWorkSection({
		position: dto.position,
		title: dto.title ? createSectionTitle(dto.title.value) : undefined,
		epigraphs: dto.epigraphs?.map((epigraph) =>
			createLiteraryWorkEpigraph({
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
function toLiteraryWork(dto: LiteraryWorkDto): LiteraryWork {
	return createLiteraryWork({
		_id: dto._id,
		slug: dto.slug,
		title: dto.title,
		authors: dto.authors,
		coverImage: dto.coverImage,
		content: dto.content.map(toSection),
		mediaSources: dto.mediaSources,
		resources: dto.resources,
		badLanguage: dto.badLanguage,
		tags: dto.tags,
		originalPublication: dto.originalPublication,
		publishedAt: createIsoDateTime(dto.publishedAt),
	});
}

@Injectable({ providedIn: 'root' })
export class HttpLiteraryWorkApi implements LiteraryWorkApi {
	private readonly url: ApiUrl = `${environment.apiUrl}${Endpoints.LiteraryWork}`;
	private readonly http = inject(HttpClient);

	public getBySlug(slug: string): Observable<LiteraryWork> {
		return this.http.get<LiteraryWorkDto>(`${this.url}/${slug}`).pipe(map(toLiteraryWork));
	}
}

export function provideLiteraryWorkApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useExisting: HttpLiteraryWorkApi }]);
}
