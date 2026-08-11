import type { StoryBySlugQueryResult } from '@sanity-types';
import { geometriaRawLiteraryWork } from '../literary-work/geometria.literary-work.raw.mock';

// Única obra del corpus con multimedia: cubre los cuatro tipos que el dominio modela más un pdfLink, que
// el schema admite y el ACL descarta — el caso real de tipo no mapeado.
//
// Se deriva de la cara de obra literaria en vez de declararse aparte: las dos proyecciones resuelven
// `audioUrl` igual, así que declararlas por separado dejaría que se desincronicen sin que nada avise. El
// tipo es el de la cara Story a propósito — que ambas caras lo satisfagan es la invariante de este espejo.
export const geometriaRawMediaSources: NonNullable<StoryBySlugQueryResult>['mediaSources'] =
	geometriaRawLiteraryWork.mediaSources;
