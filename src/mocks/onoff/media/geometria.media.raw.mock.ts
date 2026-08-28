import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { geometriaRawLiteraryWork } from '../literary-work/geometria.literary-work.raw.mock';

// Única obra del corpus con multimedia: cubre los cuatro tipos que el dominio modela más un pdfLink, que
// el schema admite y el ACL descarta — el caso real de tipo no mapeado.
//
// Se deriva del crudo de la obra en vez de declararse aparte: declararlo por separado dejaría que los
// dos se desincronicen sin que nada avise.
export const geometriaRawMediaSources: NonNullable<LiteraryWorkBySlugQueryResult>['mediaSources'] =
	geometriaRawLiteraryWork.mediaSources;
