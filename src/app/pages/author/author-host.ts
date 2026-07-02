import { InjectionToken, type Signal } from '@angular/core';

import { type AuthorProfile } from '@models/author.model';

export interface AuthorHost {
	readonly author: Signal<AuthorProfile | undefined>;
	readonly slug: Signal<string>;
}

export const AUTHOR_HOST = new InjectionToken<AuthorHost>('AUTHOR_HOST');
