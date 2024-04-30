import { BlockContent } from '@models/block-content.model';

export interface Epigraph {
	text: BlockContent[];
	reference: string;
}

export interface EpigraphDTO {
	text: BlockContent[];
	reference: string;
}
