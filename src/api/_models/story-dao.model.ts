import {AuthorDAO} from './author-dao.model';

export interface StoryDAO {
    _id: string;
    author: AuthorDAO;
    forewords: ForewordDAO[];
    review: string;
    body: any[]
}

export interface ForewordDAO {
    fwAuthor: string;
    fwText: string;
}
