import { InjectionToken, type Signal } from '@angular/core';

import { type CollectionTeaser } from '@models/collection.model';

export interface CollectionsHost {
	readonly collections: Signal<readonly CollectionTeaser[]>;
}

export const COLLECTIONS_HOST = new InjectionToken<CollectionsHost>('COLLECTIONS_HOST');
