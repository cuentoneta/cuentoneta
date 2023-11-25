import { AuthorDTO } from './author-dto';

export interface StoryDAO {
  _id: string;
  author: AuthorDTO;
  forewords: ForewordDAO[];
  review: string;
  body: any[];
}

export interface ForewordDAO {
  fwAuthor: string;
  fwText: string;
}
