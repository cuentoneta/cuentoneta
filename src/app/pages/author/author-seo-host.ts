import { InjectionToken, type Signal } from '@angular/core';

import { type AuthorProfile } from '@models/author.model';

export interface AuthorSeoHost {
	readonly author: Signal<AuthorProfile | undefined>;
}

export const AUTHOR_SEO_HOST = new InjectionToken<AuthorSeoHost>('AUTHOR_SEO_HOST');
