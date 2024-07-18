import { TextBlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';

interface AuthorBase {
	slug: string;
	name: string;
	imageUrl: string;
	resources?: Resource[];
	nationality: AuthorNationality;
}

export interface Author extends AuthorBase {
	biography?: TextBlockContent[];
}

export interface AuthorDTO extends AuthorBase {
	biography?: TextBlockContent[];
}

export type AuthorNationality = { country: string; flag: string };
