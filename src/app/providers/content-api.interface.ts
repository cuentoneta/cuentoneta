import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { LandingPageContent } from '@models/landing-page-content.model';

// Interfaz (nombre limpio) + token. La implementación HTTP vive en content.provider.ts; el doble de
// test InMemoryContentApi, en content.mock.ts. El token no lleva `providedIn`/`factory`: se cablea vía provideContentApi().
export interface ContentApi {
	getLandingPageContent(): Observable<LandingPageContent>;
}

export const ContentApi = new InjectionToken<ContentApi>('ContentApi');
