import { InjectionToken, type Signal } from '@angular/core';

import { type AuthorTeaser } from '@models/author.model';

export interface AuthorsHost {
	/** Los autores en el orden en que la página los muestra: el `ItemList` del JSON-LD lo reproduce tal cual. */
	readonly authors: Signal<readonly AuthorTeaser[]>;
}

export const AUTHORS_HOST = new InjectionToken<AuthorsHost>('AUTHORS_HOST');
