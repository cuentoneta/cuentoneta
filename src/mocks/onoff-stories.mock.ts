import type { Story } from '@models/story.model';
import { elOdioStoryMock } from './onoff/el-odio.mock';
import { elTratadoDeLosPlaceresStoryMock } from './onoff/el-tratado-de-los-placeres.mock';
import { geometriaStoryMock } from './onoff/geometria.mock';
import { lasDosAntorchasStoryMock } from './onoff/las-dos-antorchas.mock';
import { lasEscalerasStoryMock } from './onoff/las-escaleras.mock';
import { losPeldanosStoryMock } from './onoff/los-peldanos.mock';
import { neronStoryMock } from './onoff/neron.mock';
import { palacioNueveFronterasStoryMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

// Corpus de las obras (ficticias) de François Onoff, personaje del film "Una pura formalità". Cada obra es un
// `Story` completo en ./onoff/<slug>.mock.ts: `summary` reproduce la reseña de la ficha y `paragraphs` el cuerpo.
export const onoffStoriesMock: Story[] = [
	palacioNueveFronterasStoryMock,
	geometriaStoryMock,
	losPeldanosStoryMock,
	lasEscalerasStoryMock,
	elOdioStoryMock,
	elTratadoDeLosPlaceresStoryMock,
	lasDosAntorchasStoryMock,
	neronStoryMock,
];
