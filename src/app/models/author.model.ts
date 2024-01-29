import { BlockContent } from '@models/block-content.model';
import { Paragraph } from '@models/story.model';
import { Resource } from '@models/resource.model';

interface AuthorBase {
	id: string;
	name: string;
	imageUrl: string;
	fullBioUrl: string;
	resources?: Resource[];
	nationality: AuthorNationality;
}

export interface Author extends AuthorBase {
	biography?: Paragraph[];
}

export interface AuthorDTO extends AuthorBase {
	biography?: BlockContent[];
}

export type AuthorNationality = { country: string; flag: string };
