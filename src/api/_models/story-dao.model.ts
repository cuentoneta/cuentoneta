import { AuthorDAO } from './author-dto';

export interface StoryDAO {
  _id: string;
  author: AuthorDAO;
  forewords: ForewordDAO[];
  review: string;
  body: any[];
}

export interface ForewordDAO {
  fwAuthor: string;
  fwText: string;
}
