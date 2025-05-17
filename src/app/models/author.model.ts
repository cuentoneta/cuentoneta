import { TextBlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';
import { DateString } from '@utils/date.utils';

export type AuthorNationality = { country: string; flag: string };

interface AuthorBase {
	_id: string;
	slug: string;
	name: string;
	imageUrl: string;
	nationality: AuthorNationality;
	bornOn?: DateString;
	diedOn?: DateString;
}

export interface AuthorTeaser extends AuthorBase {
	biography: Array<never>;
	resources: Array<never>;
}

export interface Author extends AuthorBase {
	biography: TextBlockContent[];
	resources: Resource[];
}
