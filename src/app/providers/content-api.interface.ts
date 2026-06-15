import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { LandingPageContent } from '@models/landing-page-content.model';

export interface ContentApi {
	getLandingPageContent(): Observable<LandingPageContent>;
}

export const ContentApi = new InjectionToken<ContentApi>('ContentApi');
