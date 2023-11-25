import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { BlockContent } from '@models/block-content.model';

export interface AuthorDTO {
  id: string;
  biography?: BlockContent;
  nationality: { country: string; flag: SanityImageSource };
  fullBioUrl: string;
  imageUrl: SanityImageSource;
  name: string;
}
