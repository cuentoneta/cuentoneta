import { TextBlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';

export type AuthorNationality = { country: string; flag: string };

interface AuthorBase {
	slug: string;
	name: string;
	imageUrl: string;
	nationality: AuthorNationality;
}

export interface AuthorTeaser extends AuthorBase {
	biography: Array<never>;
	resources: Array<never>;
}

export interface Author extends AuthorBase {
	biography: TextBlockContent[];
	resources: Resource[];
}
