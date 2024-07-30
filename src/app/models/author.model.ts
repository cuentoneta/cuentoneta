import { TextBlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';

export interface Author {
	slug: string;
	name: string;
	imageUrl: string;
	nationality: AuthorNationality;
	resources: Resource[];
	biography: TextBlockContent[];
}

export type AuthorNationality = { country: string; flag: string };
