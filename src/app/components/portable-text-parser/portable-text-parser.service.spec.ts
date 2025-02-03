import { TestBed } from '@angular/core/testing';
import { PortableTextParserService } from './portable-text-parser.service';
import { authorMock } from '../../mocks/author.mock';
import { storyMock } from '../../mocks/story.mock';

describe('PortableTextParserService', () => {
	let service: PortableTextParserService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PortableTextParserService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should parse paragraphs with emphasis and bold correctly', () => {
		const authorBio = authorMock.biography.map((paragraph) => service.parseParagraph(paragraph)).join('');
		expect(authorBio).toContain('<b>François Onoff </b>');
		expect(authorBio).toContain('<i>El palacio de las nueve fronteras</i>');
		expect(authorBio).toContain('<i>Ecos del silencio</i>');
		expect(authorBio).toContain('<i>Sinfonía de sombras</i>');
		expect(authorBio).toEqual(
			'<b>François Onoff </b>(Chateauroux, 1948 - París, 1994) fue un escritor francés, reconocido como uno de los principales exponentes del realismo psicológico en la literatura de finales del siglo XX. La novela <i>El palacio de las nueve fronteras</i> (1990), en la cual realiza una profunda exploración de la psique humana y la ambigüedad de la memoria, lo catapultó a la fama internacional y es considerada su obra maestra.Onoff se destacó por su habilidad para fusionar elementos del thriller psicológico con reflexiones filosóficas sobre la identidad y la percepción de la realidad. Su colección de cuentos <i>Ecos del silencio</i> (1983) mostró por primera vez su talento para crear atmósferas inquietantes y personajes atormentados por sus propios recuerdos.Su último manuscrito inacabado, <i>Sinfonía de sombras</i>, fue publicado en 1998 y es considerado por muchos como un testimonio conmovedor de su genio creativo y una visión de la dirección que su escritura podría haber tomado de haber vivido más tiempo.',
		);

		const storySummary = storyMock.summary.map((paragraph) => service.parseParagraph(paragraph)).join('');
		expect(storySummary).toContain('<b><i>El espejo del tiempo</i></b>');
		expect(storySummary).toContain('<i>Ecos del Silencio</i>');
		expect(storySummary).toEqual(
			`<b><i>El espejo del tiempo</i></b> forma parte de la colección <i>Ecos del Silencio</i> (1983), la primera colección de cuentos publicada por Onoff. Mediante un estilo de realismo psicológico, el autor narra en esta breve historia la forma en que los recuerdos y el pasado pueden atormentar y distorsionar la percepción del presente. Onoff instala el espejo antiguo como un portal metafórico entre el presente y el pasado de la protagonista, utilizándolo como un dispositivo para explorar la fragilidad de la mente humana frente a la culpa y el arrepentimiento.`,
		);

		const storyMediaDescription = storyMock.media[0].description
			.map((paragraph) => service.parseParagraph(paragraph))
			.join('');
		console.log(storyMediaDescription);
		expect(storyMediaDescription).toContain(`<a href="https://www.youtube.com/@CanalMas" class="underline">Canal+</a>`);
		expect(storyMediaDescription).toContain(`<i>Le Ble Chateau</i>`);
		expect(storyMediaDescription).toEqual(
			`Narración del cuento a cargo de Gérard Depardieu, transmitido como parte de un episodio de su programa radial <i>Le Ble Chateau</i>, tomado del canal de <a href="https://www.youtube.com/@CanalMas" class="underline">Canal+</a>.`,
		);
	});

	it('should append classes correctly', () => {
		const result = service.appendClasses(authorMock.biography[0], 'test 123');
		expect(result).toContain('test 123');
	});
});
