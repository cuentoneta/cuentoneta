import { AuthorDTO } from './author-dto';

export interface StoryDTO {
  _id: string;
  author: AuthorDTO;
  forewords: ForewordDTO[];
  review: string;
  body: any[];
}

export interface ForewordDTO {
  fwAuthor: string;
  fwText: string;
}
