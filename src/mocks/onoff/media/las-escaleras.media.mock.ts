import type { Media } from '@models/media.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { lasEscalerasAudioDescription } from './las-escaleras.media';

// La obra con un único medio. Es el contracaso de `geometria`, que los declara todos: sin ella, el corpus
// no tiene dónde afirmar lo que un consumidor hace cuando no hay entre qué elegir.
export const lasEscalerasMediaMock: Media[] = [
	{
		title: 'Lectura de "Las escaleras" por su autor',
		type: 'audioRecording',
		description: markdownToSanitizedHtml(createMarkdown(lasEscalerasAudioDescription)),
		data: { url: 'https://cdn.example.org/onoff/las-escaleras.ogg' },
	},
];
