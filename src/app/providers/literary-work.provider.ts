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
import { createChapterTitle } from '@models/chapter-title.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import { createIsoDateTime } from '@utils/date.utils';
import { ApiUrl, Endpoints } from './endpoints';
import { LiteraryWorkApi, type LiteraryWorkDto, type LiteraryWorkSectionDto } from './literary-work-api.interface';

function toSection(dto: LiteraryWorkSectionDto): LiteraryWorkSection {
	return createLiteraryWorkSection({
		position: dto.position,
		chapterTitle: dto.chapterTitle ? createChapterTitle(dto.chapterTitle.value) : undefined,
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
// factories — datos inválidos lanzan acá, no en un template. El totalReadingTime del wire entra
// como override: es el valor autoritativo que el backend ya resolvió (suma u override editorial);
// re-derivarlo de las secciones lo perdería.
function toLiteraryWork(dto: LiteraryWorkDto): LiteraryWork {
	return createLiteraryWork({
		...dto,
		content: dto.content.map(toSection),
		publishedAt: createIsoDateTime(dto.publishedAt),
		readingTimeOverride: createReadingTime(dto.totalReadingTime),
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
