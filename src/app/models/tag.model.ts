import { Icon } from '@models/icon.model';

export interface Tag {
	title: string;
	slug: string;
	description: string;
	icon?: Icon;
}
