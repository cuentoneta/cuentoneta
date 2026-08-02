import { spyOn } from '@test-utils';
import { mapMediaSources } from './media-sources.functions';
import { onoffRawStoriesWithMediaSources, onoffRawTeasersWithMediaSources } from '@mocks/onoff-raw-stories.mock';
import { isAudioRecording, isSpaceRecording, isSpotifyPodcastEpisode, isYouTubeVideo } from '@models/media.model';
import { geometriaAudioDescription } from '@mocks/onoff/geometria.media';

const [rawStory] = onoffRawStoriesWithMediaSources;
const [rawTeaser] = onoffRawTeasersWithMediaSources;

function rawSourceOfType<T extends (typeof rawStory.mediaSources)[number]['_type']>(type: T) {
	const source = rawStory.mediaSources.find((mediaSource) => mediaSource._type === type);
	if (source === undefined) {
		throw new Error(`El fixture no trae un mediaSource de tipo "${type}"`);
	}
	return source as Extract<(typeof rawStory.mediaSources)[number], { _type: T }>;
}

describe('mapMediaSources', () => {
	it('mapea el audio recording con su url', () => {
		const [audioRecording] = mapMediaSources(rawStory.mediaSources).filter(isAudioRecording);
		const source = rawSourceOfType('audioRecording');

		expect(audioRecording.title).toBe(source.title);
		expect(audioRecording.data.url).toBe(source.url);
	});

	it('mapea el space recording resolviendo audioUrl y su metadata', () => {
		const [spaceRecording] = mapMediaSources(rawStory.mediaSources).filter(isSpaceRecording);
		const source = rawSourceOfType('spaceRecording');

		expect(spaceRecording.data.url).toBe(source.audioUrl);
		expect(spaceRecording.data.duration).toBe(source.duration);
		expect(spaceRecording.data.hostName).toBe(source.hostName);
	});

	it('mapea el episodio de podcast y el video con su dato propio', () => {
		const mapped = mapMediaSources(rawStory.mediaSources);
		const [podcast] = mapped.filter(isSpotifyPodcastEpisode);
		const [video] = mapped.filter(isYouTubeVideo);

		expect(podcast.data.url).toBe(rawSourceOfType('spotifyPodcastEpisode').url);
		expect(video.data.videoId).toBe(rawSourceOfType('youTubeVideo').videoId);
	});

	// El fixture lleva un pdfLink: un `_type` que el schema admite y el dominio no modela.
	it('descarta el tipo que el dominio no modela', () => {
		const mapped = mapMediaSources(rawStory.mediaSources);

		expect(rawSourceOfType('pdfLink')).toBeTruthy();
		expect(mapped.map((media) => media.type)).toEqual([
			'audioRecording',
			'spaceRecording',
			'spotifyPodcastEpisode',
			'youTubeVideo',
		]);
	});
});

describe('mapMediaSources sobre la proyección de teaser', () => {
	it('mapea los mismos tipos que la proyección completa', () => {
		const mapped = mapMediaSources(rawTeaser.mediaSources);

		expect(mapped.map((media) => media.type)).toEqual([
			'audioRecording',
			'spaceRecording',
			'spotifyPodcastEpisode',
			'youTubeVideo',
		]);
	});

	// La proyección de teaser no resuelve audioUrl, pero sí trae el resto de la metadata: el space
	// recording del teaser es una SpaceRecording válida con la url en null, no un objeto vacío.
	it('produce un space recording con su metadata y la url en null', () => {
		const [spaceRecording] = mapMediaSources(rawTeaser.mediaSources).filter(isSpaceRecording);
		const source = rawSourceOfType('spaceRecording');

		expect(spaceRecording.data.url).toBeNull();
		expect(spaceRecording.data.duration).toBe(source.duration);
		expect(spaceRecording.data.hostName).toBe(source.hostName);
	});
});

describe('la descripción cruza el pipeline de Markdown', () => {
	it('entrega HTML saneado y no el Markdown crudo', () => {
		const [audioRecording] = mapMediaSources(rawStory.mediaSources).filter(isAudioRecording);

		expect(audioRecording.description).toBe(`<p>${geometriaAudioDescription}</p>`);
	});

	it('preserva el énfasis, la negrita y el enlace del fixture', () => {
		const mapped = mapMediaSources(rawStory.mediaSources);
		const [spaceRecording] = mapped.filter(isSpaceRecording);
		const [podcast] = mapped.filter(isSpotifyPodcastEpisode);

		expect(spaceRecording.description).toContain('<em>cuaderno de 1971</em>');
		expect(spaceRecording.description).toContain('<a href="https://cdn.example.org/onoff/geometria.pdf"');
		expect(podcast.description).toContain('<strong>podcast</strong>');
	});

	// `createMarkdown` rechaza el contenido vacío. Acá se verifica qué hace el ACL con ese rechazo: lo
	// contiene descartando el recurso, porque una descripción vacía es un dato que el schema admitió
	// antes de volverse requerido y no puede costar la respuesta entera.
	it('descarta con rastro el recurso cuya descripción está vacía', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const source = rawSourceOfType('audioRecording');

		const mapped = mapMediaSources([{ ...source, description: '' }]);

		expect(mapped).toEqual([]);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('no pudo mapearse'),
			expect.objectContaining({ _key: source._key, _type: source._type }),
		);
	});

	// La contención toma dos formas según qué quede después de sanear, y las dos son seguras: o el
	// recurso sobrevive sin el fragmento peligroso, o se descarta entero porque no le quedó contenido.
	// Lo que ninguna descripción puede hacer es llegar con el residuo puesto.
	it.each([
		['un manejador de evento inline', '<img src=x onerror="alert(1)">Texto.', 'onerror', '<p>Texto.</p>'],
		['un enlace con protocolo javascript', '[Enlace](javascript:alert(1))', 'javascript:', '<p><a>Enlace</a></p>'],
		[
			'una etiqueta script tras texto válido',
			'Texto seguro.\n\n<script>alert(1)</script>',
			'script',
			'<p>Texto seguro.</p>',
		],
	])('sanea %s sin perder el recurso', (_caso, description, residuo, esperado) => {
		const source = rawSourceOfType('audioRecording');

		const [audioRecording] = mapMediaSources([{ ...source, description }]).filter(isAudioRecording);

		expect(audioRecording.description).toBe(esperado);
		expect(audioRecording.description).not.toContain(residuo);
	});

	// Una descripción que es solo el vector queda vacía al sanearla, y una descripción vacía no
	// construye el value object: el recurso se descarta con rastro, igual que el caso de arriba.
	it('descarta el recurso cuya descripción entera es un vector de XSS', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const source = rawSourceOfType('audioRecording');

		const mapped = mapMediaSources([{ ...source, description: '<script>alert(1)</script>Texto.' }]);

		expect(mapped).toEqual([]);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('no pudo mapearse'),
			expect.objectContaining({ _key: source._key }),
		);
	});
});

describe('descarte de un tipo sin modelo de dominio', () => {
	it('deja rastro en el log en vez de descartarlo en silencio', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);

		mapMediaSources(rawStory.mediaSources);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('pdfLink'), {
			_key: rawSourceOfType('pdfLink')._key,
		});
	});
});
