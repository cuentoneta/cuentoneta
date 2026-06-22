import { TextBlockContent } from '@models/block-content.model';
import { Resource } from '@models/resource.model';
import { Tag } from '@models/tag.model';
import { DateString, IsoDateTime } from '@utils/date.utils';

export type AuthorNationality = { country: string; flag: string };

interface AuthorBase {
	_id: string;
	slug: string;
	name: string;
	imageUrl: string;
	nationality: AuthorNationality;
	tags: Tag[];
	bornOn?: DateString;
	diedOn?: DateString;
	bornOnYear?: number;
	diedOnYear?: number;
}

export interface AuthorTeaser extends AuthorBase {
	biography: Array<never>;
	resources: Array<never>;
}

export interface Author extends AuthorBase {
	biography: TextBlockContent[];
	resources: Resource[];
}

// La página de perfil necesita las fechas de la ficha (campos de sistema de Sanity) para el
// JSON-LD `ProfilePage`. No viven en `Author` porque la story embebe un autor que no las usa.
export interface AuthorProfile extends Author {
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
}
