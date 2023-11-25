import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { BlockContent } from '@models/block-content.model';

export interface AuthorDAO {
  id: string;
  biography?: BlockContent;
  nationality: { country: string; flag: SanityImageSource };
  fullBioUrl: string;
  imageUrl: SanityImageSource;
  name: string;
}
