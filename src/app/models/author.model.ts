import { BlockContent } from '@models/block-content.model';

interface AuthorBase {
  id: number;
  name: string;
  imageUrl: string;
  nationality: AuthorNationality;
  fullBioUrl: string;
}

export interface Author extends AuthorBase {
  biography?: string[];
}

export interface AuthorDTO extends AuthorBase {
  biography?: BlockContent[];
}

export type AuthorNationality = { country: string; flag: string };
