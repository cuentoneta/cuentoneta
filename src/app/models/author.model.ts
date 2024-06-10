import { BlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';

interface AuthorBase {
	slug: string;
	name: string;
	imageUrl: string;
	resources?: Resource[];
	nationality: AuthorNationality;
}

export interface Author extends AuthorBase {
	biography?: BlockContent[];
}

export interface AuthorDTO extends AuthorBase {
	biography?: BlockContent[];
}

export type AuthorNationality = { country: string; flag: string };
