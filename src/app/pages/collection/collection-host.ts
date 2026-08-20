import { InjectionToken, type Signal } from '@angular/core';

import { type Collection } from '@models/collection.model';

export interface CollectionHost {
	readonly collection: Signal<Collection | undefined>;
}

export const COLLECTION_HOST = new InjectionToken<CollectionHost>('COLLECTION_HOST');
