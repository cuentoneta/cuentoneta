import { onoffAudioAssets } from '../../src/mocks/onoff-audio-assets.mock';

export type AudioClip = {
	/** La clave de `onoffAudioAssets` cuyo archivo produce esta fila. */
	readonly asset: keyof typeof onoffAudioAssets;
	/** El cuerpo Markdown del que sale el fragmento, relativo a la raíz del repo. */
	readonly source: string;
	/** Cuántas oraciones saltear antes de empezar a leer, para que dos clips de una misma obra difieran. */
	readonly skipSentences: number;
};

// Presupuesto de palabras del fragmento. Es el mando con el que se apunta a la duración objetivo: el
// corte real cae en el límite de oración anterior, así que el clip sale igual o más corto que esto.
const MAX_WORDS = 60;

/** El corte duro del encodeo, en segundos: lo que separa un clip de una lectura completa. */
export const MAX_SECONDS = 20;

export const excerptOptions = Object.freeze({ maxWords: MAX_WORDS } as const);

// Qué se lee en cada clip. El destino no se declara acá: sale de `onoffAudioAssets`, así que el generador
// no puede escribir en una ruta que el corpus no sirva.
export const audioClips: readonly AudioClip[] = Object.freeze([
	{ asset: 'geometria', source: 'src/mocks/onoff/literary-work/geometria.md', skipSentences: 0 },
	{ asset: 'geometriaSpace', source: 'src/mocks/onoff/literary-work/geometria.md', skipSentences: 8 },
	{ asset: 'lasEscaleras', source: 'src/mocks/onoff/literary-work/las-escaleras.md', skipSentences: 0 },
] satisfies readonly AudioClip[]);
