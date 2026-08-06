import type { Collection, CollectionTeaser } from '@models/collection.model';

export interface CollectionRepository {
	fetchBySlug(slug: string): Promise<Collection | null>;
	fetchAll(): Promise<Collection[]>;
	fetchTeasers(): Promise<CollectionTeaser[]>;
}
