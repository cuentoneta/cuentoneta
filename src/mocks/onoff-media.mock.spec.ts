import {
	mediaDescriptionText,
	onoffAudioRecordingsMock,
	onoffMediaMock,
	onoffSpaceRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from './onoff-media.mock';

// Los selectores derivan de una sola obra del corpus. Sin estos guards, quitarle un tipo de medio a esa
// obra no rompe acá sino en la decena de specs y stories que hacen `onoffYouTubeVideosMock[0]`, con un
// "Cannot read properties of undefined" que no dice qué se rompió ni dónde.
describe('onoffMediaMock (canon de multimedia del corpus)', () => {
	it.each([
		['audio recordings', onoffAudioRecordingsMock],
		['space recordings', onoffSpaceRecordingsMock],
		['YouTube videos', onoffYouTubeVideosMock],
		['Spotify podcast episodes', onoffSpotifyPodcastEpisodesMock],
	])('should keep at least one item in the %s selector', (_selector, selection) => {
		expect(selection.length).toBeGreaterThan(0);
	});

	it('should cover every media type exactly once between the selectors', () => {
		const selected =
			onoffAudioRecordingsMock.length +
			onoffSpaceRecordingsMock.length +
			onoffYouTubeVideosMock.length +
			onoffSpotifyPodcastEpisodesMock.length;

		expect(selected).toBe(onoffMediaMock.length);
	});

	// La descripción viaja como HTML saneado: si alguien la revirtiera a texto plano o a Portable Text,
	// las specs de los widgets dejarían de probar el render de HTML sin fallar.
	it('should carry every description as rendered HTML', () => {
		for (const media of onoffMediaMock) {
			expect(media.description).toMatch(/^<p>.*<\/p>$/s);
		}
	});

	// El helper es el que consumen las specs de los widgets para afirmar sobre el fixture: si devolviera
	// vacío, esas aserciones pasarían a comparar '' contra '' sin probar nada.
	it('should derive non-empty plain text from every description', () => {
		for (const media of onoffMediaMock) {
			expect(mediaDescriptionText(media)).toMatch(/\S/);
		}
	});
});
