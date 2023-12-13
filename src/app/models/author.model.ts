import { BlockContent } from '@models/block-content.model';
import { Paragraph } from '@models/story.model'

interface AuthorBase {
  id: number;
  name: string;
  imageUrl: string;
  nationality: AuthorNationality;
  fullBioUrl: string;
}

export interface Author extends AuthorBase {
  biography?: Paragraph[];
}

export interface AuthorDTO extends AuthorBase {
  biography?: BlockContent[];
}

export type AuthorNationality = { country: string; flag: string };
