import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';

import { type LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from '../../providers/content-api.interface';

export const homeContentResolver: ResolveFn<LandingPageContent> = () => {
	const contentApi = inject(ContentApi);
	return contentApi.getLandingPageContent();
};
