import { InjectionToken, type Signal } from '@angular/core';

import { type AuthorTeaser } from '@models/author.model';

export interface AuthorsHost {
	readonly authors: Signal<readonly AuthorTeaser[]>;
}

export const AUTHORS_HOST = new InjectionToken<AuthorsHost>('AUTHORS_HOST');
