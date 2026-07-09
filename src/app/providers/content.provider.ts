// Core
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';

// Environment
import { environment } from '../environments/environment';

// Models
import { LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from './content-api.interface';
import { highlightedAuthorsMock } from '@mocks/highlighted-authors.mock';

@Injectable({ providedIn: 'root' })
export class HttpContentApi implements ContentApi {
	private readonly prefix = `${environment.apiUrl}api/content`;
	private http = inject(HttpClient);

	public getLandingPageContent(): Observable<LandingPageContent> {
		return this.http
			.get<LandingPageContent>(`${this.prefix}/landing-page`)
			.pipe(map((content) => this.withDevHighlightedAuthorsFallback(content)));
	}

	private withDevHighlightedAuthorsFallback(content: LandingPageContent): LandingPageContent {
		if (environment.environment === 'production' || content.highlightedAuthors.length > 0) {
			return content;
		}
		return { ...content, highlightedAuthors: highlightedAuthorsMock };
	}
}

export function provideContentApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: ContentApi, useExisting: HttpContentApi }]);
}
