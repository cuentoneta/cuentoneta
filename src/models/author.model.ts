import { Resource } from '@models/resource.model';
import { SanitizedHtml } from '@models/sanitized-html.model';
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

// La biografía no se declara: en una vista de teaser no viaja, y esa ausencia se expresa en el tipo
// y no en un valor vacío, porque `SanitizedHtml` no admite uno.
export interface AuthorTeaser extends AuthorBase {
	resources: Array<never>;
}

export interface Author extends AuthorBase {
	biography: SanitizedHtml;
	resources: Resource[];
}

// La página de perfil necesita las fechas de la ficha (campos de sistema de Sanity) para el
// JSON-LD `ProfilePage`. No viven en `Author` porque la story embebe un autor que no las usa.
export interface AuthorProfile extends Author {
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
}
