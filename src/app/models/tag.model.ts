import { Icon } from '@models/icon.model';
import { TextBlockContent } from '@models/block-content.model';

export interface Tag {
	title: string;
	slug: string;
	description: TextBlockContent[];
	icon?: Icon;
}
