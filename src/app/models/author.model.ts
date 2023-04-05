export interface Author {
    id: number;
    name: string;
    imageUrl: string;
    nationality: AuthorNationality;
    biography?: string;
    fullBioUrl: string;
}

export type AuthorNationality = { country: string; flag: string };
