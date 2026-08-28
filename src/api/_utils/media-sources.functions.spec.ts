import { spyOn } from '@test-utils';
import { mapMediaSources, mapMediaTeasers } from './media-sources.functions';
import { onoffRawCollectionsMock, onoffRawCollectionWorksWithMediaSources } from '@mocks/onoff-raw-collections.mock';
import { onoffRawLiteraryWorksWithMediaSources } from '@mocks/onoff-raw-literary-works.mock';
import { isAudioRecording, isSpaceRecording, isSpotifyPodcastEpisode, isYouTubeVideo } from '@models/media.model';
import { onoffAudioRecordingsMock } from '@mocks/onoff-media.mock';

const [rawLiteraryWork] = onoffRawLiteraryWorksWithMediaSources;
const [rawCollection] = onoffRawCollectionsMock;

function sourceOfType<S extends { _type: string }, T extends S['_type']>(sources: readonly S[], type: T) {
	const source = sources.find((mediaSource) => mediaSource._type === type);
	if (source === undefined) {
		throw new Error(`El fixture no trae un mediaSource de tipo "${type}"`);
	}
	return source as Extract<S, { _type: T }>;
}

function rawSourceOfType<T extends (typeof rawLiteraryWork.mediaSources)[number]['_type']>(type: T) {
	return sourceOfType(rawLiteraryWork.mediaSources, type);
}

describe('mapMediaSources', () => {
	it('mapea el audio recording con su url', () => {
		const [audioRecording] = mapMediaSources(rawLiteraryWork.mediaSources).filter(isAudioRecording);
		const source = rawSourceOfType('audioRecording');

		expect(audioRecording.title).toBe(source.title);
		expect(audioRecording.data.url).toBe(source.url);
	});

	it('mapea el space recording resolviendo audioUrl y su metadata', () => {
		const [spaceRecording] = mapMediaSources(rawLiteraryWork.mediaSources).filter(isSpaceRecording);
		const source = rawSourceOfType('spaceRecording');

		expect(spaceRecording.data.url).toBe(source.audioUrl);
		expect(spaceRecording.data.duration).toBe(source.duration);
		expect(spaceRecording.data.hostName).toBe(source.hostName);
	});

	it('mapea el episodio de podcast y el video con su dato propio', () => {
		const mapped = mapMediaSources(rawLiteraryWork.mediaSources);
		const [podcast] = mapped.filter(isSpotifyPodcastEpisode);
		const [video] = mapped.filter(isYouTubeVideo);

		expect(podcast.data.url).toBe(rawSourceOfType('spotifyPodcastEpisode').url);
		expect(video.data.videoId).toBe(rawSourceOfType('youTubeVideo').videoId);
	});

	// El fixture lleva un pdfLink: un `_type` que el schema admite y el dominio no modela.
	it('descarta el tipo que el dominio no modela', () => {
		const mapped = mapMediaSources(rawLiteraryWork.mediaSources);

		expect(rawSourceOfType('pdfLink')).toBeTruthy();
		expect(mapped.map((media) => media.type)).toEqual([
			'audioRecording',
			'spaceRecording',
			'spotifyPodcastEpisode',
			'youTubeVideo',
		]);
	});
});

// La colección es la otra entrada de la unión que acepta mapMediaSources: sin estos casos, esa rama
// quedaría sin cobertura y una divergencia de su proyección solo se vería en producción.
describe('mapMediaSources sobre la proyección de colección', () => {
	it('mapea cada recurso de la colección a su tipo de dominio, en orden', () => {
		const mapped = mapMediaSources(rawCollection.mediaSources);

		expect(mapped.map((media) => media.type)).toEqual(rawCollection.mediaSources.map((source) => source._type));
	});

	it('entrega el dato propio de cada tipo y la descripción ya saneada', () => {
		const mapped = mapMediaSources(rawCollection.mediaSources);
		const [podcast] = mapped.filter(isSpotifyPodcastEpisode);
		const [video] = mapped.filter(isYouTubeVideo);

		expect(podcast.data.url).toBe(sourceOfType(rawCollection.mediaSources, 'spotifyPodcastEpisode').url);
		expect(video.data.videoId).toBe(sourceOfType(rawCollection.mediaSources, 'youTubeVideo').videoId);
		expect(podcast.description).toMatch(/^<p>/);
	});

	// El único campo que la proyección deriva en vez de transportar. Se afirma sobre la colección
	// además de sobre la obra porque el mapeo lo lee sin distinguir de cuál de las dos viene: si una
	// de ellas dejara de resolverlo, acá se ve.
	it('resuelve la url del audio del space recording de la colección', () => {
		const [spaceRecording] = mapMediaSources(rawCollection.mediaSources).filter(isSpaceRecording);
		const source = sourceOfType(rawCollection.mediaSources, 'spaceRecording');

		expect(spaceRecording.data.url).toBe(source.audioUrl);
		expect(spaceRecording.data.duration).toBe(source.duration);
		expect(spaceRecording.data.hostName).toBe(source.hostName);
	});
});

describe('la descripción cruza el pipeline de Markdown', () => {
	// Que el resultado de mapear el raw coincida con lo que el canon declara para esa misma obra es lo
	// que ata las dos puntas: si el mapper dejara de pasar por el pipeline, el ACL devolvería el Markdown
	// crudo y esta igualdad se rompería. El shape de párrafo lo confirma desde el otro lado.
	it('entrega HTML saneado y no el Markdown crudo', () => {
		const [audioRecording] = mapMediaSources(rawLiteraryWork.mediaSources).filter(isAudioRecording);

		expect(audioRecording.description).toBe(onoffAudioRecordingsMock[0].description);
		expect(audioRecording.description).toMatch(/^<p>.*<\/p>$/s);
	});

	it('preserva el énfasis, la negrita y el enlace del fixture', () => {
		const mapped = mapMediaSources(rawLiteraryWork.mediaSources);
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

		mapMediaSources(rawLiteraryWork.mediaSources);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('pdfLink'), {
			_key: rawSourceOfType('pdfLink')._key,
		});
	});
});

describe('mapMediaTeasers', () => {
	const rawWork = onoffRawCollectionWorksWithMediaSources[0];

	// Derivado del fixture: sumar un medio a la obra del canon no debe romper el caso, y sumar uno de
	// un tipo que el dominio no modela debe quedar cubierto por el descarte de abajo.
	const modeled = rawWork.mediaSources.filter((source) => source._type !== 'pdfLink');

	it('mapea cada recurso modelado a su tag y su título, en orden', () => {
		expect(mapMediaTeasers(rawWork.mediaSources)).toEqual(
			modeled.map((source) => ({ type: source._type, title: source.title })),
		);
	});

	it('descarta con rastro los tipos sin modelo de dominio', () => {
		const unmodeled = rawWork.mediaSources.filter((source) => source._type === 'pdfLink');
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		// Un spyOn sobre un método ya espiado devuelve el mismo spy, con el historial de los casos
		// anteriores del archivo: sin limpiarlo, contar llamadas mediría también las de ellos.
		warn.mockClear();

		mapMediaTeasers(rawWork.mediaSources);

		expect(warn).toHaveBeenCalledTimes(unmodeled.length);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('pdfLink'));
	});
});
