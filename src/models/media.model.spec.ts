import {
	isAudioRecording,
	isSpaceRecording,
	isSpotifyPodcastEpisode,
	isYouTubeVideo,
	type Media,
	type MediaTeaser,
} from './media.model';
import {
	onoffAudioRecordingsMock,
	onoffSpaceRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from '@mocks/onoff-media.mock';

const guards = [
	{ name: 'isAudioRecording', guard: isAudioRecording, own: onoffAudioRecordingsMock[0] },
	{ name: 'isSpaceRecording', guard: isSpaceRecording, own: onoffSpaceRecordingsMock[0] },
	{ name: 'isYouTubeVideo', guard: isYouTubeVideo, own: onoffYouTubeVideosMock[0] },
	{ name: 'isSpotifyPodcastEpisode', guard: isSpotifyPodcastEpisode, own: onoffSpotifyPodcastEpisodesMock[0] },
];

const everyMedia: Media[] = guards.map((entry) => entry.own);

describe('type guards de Media', () => {
	it.each(guards)('$name reconoce su propio tipo', ({ guard, own }) => {
		expect(guard(own)).toBe(true);
	});

	it.each(guards)('$name rechaza los demás tipos', ({ guard, own }) => {
		const others = everyMedia.filter((media) => media !== own);

		expect(others.map((media) => guard(media))).toEqual([false, false, false]);
	});
});

// La asimetría entre las dos vistas la evalúa el gate `typecheck`, que cubre los *.spec.ts: si
// alguna de estas afirmaciones dejara de ser verdad, el gate corta acá y no en la página.
describe('asignabilidad entre la vista de teaser y la completa', () => {
	it('no admite un teaser donde se espera la vista completa', () => {
		const teaser: MediaTeaser = { type: 'audioRecording', title: 'Lectura del autor' };

		// @ts-expect-error al teaser le faltan `description` y `data`
		const asMedia: Media = teaser;

		expect(asMedia.type).toBe('audioRecording');
	});

	// El caso que aísla a `data`: con los otros dos campos presentes, lo único que separa esta forma
	// de la vista completa es la carga. Mientras `data` fue opcional, esto compilaba — y es la forma
	// que arma cualquier consumidor que copie los campos textuales de un listado.
	it('no admite la vista completa sin su carga', () => {
		const withoutData = {
			title: 'Lectura del autor',
			description: onoffAudioRecordingsMock[0].description,
			type: 'audioRecording',
		} as const;

		// @ts-expect-error falta `data`, obligatorio en la vista completa
		const asMedia: Media = withoutData;

		expect(asMedia.type).toBe('audioRecording');
	});

	it('admite la vista completa donde se espera un teaser', () => {
		const media: Media = onoffAudioRecordingsMock[0];
		const asTeaser: MediaTeaser = media;

		expect(asTeaser.type).toBe(media.type);
	});
});
