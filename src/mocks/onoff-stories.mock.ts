import type { Story } from '@models/story.model';
import { elOdioStoryMock } from './onoff/story/el-odio.story.mock';
import { elTratadoDeLosPlaceresStoryMock } from './onoff/story/el-tratado-de-los-placeres.story.mock';
import { geometriaStoryMock } from './onoff/story/geometria.story.mock';
import { lasDosAntorchasStoryMock } from './onoff/story/las-dos-antorchas.story.mock';
import { lasEscalerasStoryMock } from './onoff/story/las-escaleras.story.mock';
import { losPeldanosStoryMock } from './onoff/story/los-peldanos.story.mock';
import { neronStoryMock } from './onoff/story/neron.story.mock';
import { palacioNueveFronterasStoryMock } from './onoff/story/el-palacio-de-las-nueve-fronteras.story.mock';

// Corpus de las obras (ficticias) de François Onoff, personaje del film "Una pura formalità". Cada obra es un
// `Story` completo en ./onoff/story/<slug>.story.mock.ts: `summary` reproduce la reseña de la ficha y
// `paragraphs` el cuerpo.
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
