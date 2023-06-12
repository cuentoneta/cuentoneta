import {SanityImageSource} from '@sanity/image-url/lib/types/types';

export interface AuthorDAO {
    _id: string;
    bio: string;
    nationality: { country: string; flag: SanityImageSource };
    fullBioUrl: string;
    image: SanityImageSource;
    name: string;
}
