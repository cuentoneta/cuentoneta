import { TextBlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';

export type AuthorNationality = { country: string; flag: string };

interface AuthorBase<T> {
	slug: string;
	name: string;
	imageUrl: string;
	nationality: AuthorNationality;
	resources: Resource[];
	biography: T[];
}

export interface AuthorTeaser extends AuthorBase<never> {
	biography: Array<never>;
}

export interface Author extends AuthorBase<TextBlockContent> {
	biography: TextBlockContent[];
}
