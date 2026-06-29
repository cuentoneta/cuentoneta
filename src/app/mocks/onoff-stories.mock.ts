import type { Story } from '@models/story.model';
import { authorMock } from './author.mock';

// Corpus de mocks de las obras (ficticias) de François Onoff, personaje del film "Una pura formalità".
// `summary` reproduce la reseña de la ficha técnica; `paragraphs` es cuerpo ficticio generado a partir de ella.

export const palacioNueveFronterasStoryMock: Story = {
	_id: 'onoff-story-el-palacio-de-las-nueve-fronteras',
	title: 'El palacio de las nueve fronteras',
	slug: 'el-palacio-de-las-nueve-fronteras',
	originalPublication: 'Éditions du Méridien (1985)',
	approximateReadingTime: 8,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/el-palacio-de-las-nueve-fronteras.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1985-01-01T00:00:00Z',
	updatedAt: '1985-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-palacio-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-palacio-sum-s',
					text: 'La novela se organiza en nueve fronteras —territorios donde ninguna ley vale del todo y ninguna lengua se habla por completo— y la cruza un narrador que escribe para devolverle algo a un hombre cuyo cuerpo cayó ante su vista: «ese cuerpo necesitaba un aliento… esos ojos vacíos, una mirada; esos labios, un último gemido… y ese sueño, algún durmiente».',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-palacio-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-palacio-b1-s',
					text: 'Crucé la primera frontera al amanecer, cuando los guardias aún dormían y las palabras del idioma anterior empezaban a deshacerse en mi boca. Llevaba conmigo un nombre que no era el mío y la certeza, cada vez más delgada, de que escribir era la única forma de devolver lo que había visto caer.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-palacio-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-palacio-b2-s',
					text: 'El hombre había caído sin un gemido y, sin embargo, yo seguía oyéndolo. Su cuerpo necesitaba un aliento; sus ojos vacíos, una mirada; sus labios, un último sonido. Avancé hacia la segunda frontera comprendiendo que el palacio no tenía dueño: era apenas el lugar donde un muerto esperaba que alguien lo soñara.',
				},
			],
		},
	],
};

export const geometriaStoryMock: Story = {
	_id: 'onoff-story-geometria',
	title: 'Geometría',
	slug: 'geometria',
	originalPublication: 'Éditions du Méridien (1974)',
	approximateReadingTime: 4,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/geometria.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1974-01-01T00:00:00Z',
	updatedAt: '1974-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-geometria-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-geometria-sum-s',
					text: 'Shannon, insomne crónico, se despierta cada madrugada exactamente a las tres y media y nunca duerme más de dos horas: una vida reducida a coordenadas, donde el desvelo funciona como una geometría del tiempo que no deja resquicios.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-geometria-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-geometria-b1-s',
					text: 'A las tres y media Shannon abrió los ojos, como cada madrugada, y supo que ya no dormiría. La oscuridad del cuarto tenía siempre la misma forma: un rectángulo de sombra, un eje de luz bajo la puerta, el punto fijo del reloj. Se levantó a medir.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-geometria-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-geometria-b2-s',
					text: 'Había aprendido a habitar el desvelo como quien traza un plano. Dos horas de sueño, veintidós de vigilia: una proporción exacta que no admitía error ni piedad. Mientras la ciudad dormía, repetía sus coordenadas y sentía que el tiempo, por fin, le obedecía.',
				},
			],
		},
	],
};

export const losPeldanosStoryMock: Story = {
	_id: 'onoff-story-los-peldanos',
	title: 'Los peldaños',
	slug: 'los-peldanos',
	originalPublication: 'Éditions du Méridien (1977)',
	approximateReadingTime: 5,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/los-peldanos.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1977-01-01T00:00:00Z',
	updatedAt: '1977-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-peldanos-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-peldanos-sum-s',
					text: 'La Sra. Oneiras saca del bolsillo de la falda un trozo de pescado hervido y lo come mirando fijamente al frente, sin ver nada, y luego pasa a un centímetro del protagonista como si no existiese. Subir y bajar peldaños es menos un desplazamiento físico que un estado de ánimo.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-peldanos-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-peldanos-b1-s',
					text: 'La Sra. Oneiras subió tres peldaños y se detuvo. Del bolsillo de la falda sacó un trozo de pescado hervido y lo comió mirando al frente, sin ver nada, como si la escalera continuara dentro de ella.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-peldanos-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-peldanos-b2-s',
					text: 'Pasó a un centímetro de mí y no me reconoció; tampoco se reconocía a sí misma. Bajar y subir eran para ella estados de ánimo, no desplazamientos. La seguí con la vista hasta que se perdió en un rellano que, juraría, no estaba allí un momento antes.',
				},
			],
		},
	],
};

export const lasEscalerasStoryMock: Story = {
	_id: 'onoff-story-las-escaleras',
	title: 'Las escaleras',
	slug: 'las-escaleras',
	originalPublication: 'Éditions du Méridien (1979)',
	approximateReadingTime: 6,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/las-escaleras.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1979-01-01T00:00:00Z',
	updatedAt: '1979-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-escaleras-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-escaleras-sum-s',
					text: 'Su tercer capítulo, «El regreso del druso», contiene el discurso del príncipe Cosme antes de colocar los mosaicos: un parque poblado de hombres arrodillados y bailarines abandonados, con frescos de figuras en cuclillas en la sombra.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-escaleras-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-escaleras-b1-s',
					text: 'Dos años después, la Sra. Oneiras había dejado de fingir. Estábamos a mitad del libro y a mitad de la escalera cuando dijo, sin volverse, que ya no subiría conmigo.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-escaleras-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-escaleras-b2-s',
					text: 'Esa noche el príncipe Cosme pronunció su discurso antes de colocar los mosaicos: habló de un parque poblado de hombres arrodillados y bailarines abandonados, de frescos con figuras en cuclillas en la sombra. Nadie entendió si describía el jardín o la ruptura; quizá, como todo en Onoff, eran la misma cosa.',
				},
			],
		},
	],
};

export const elOdioStoryMock: Story = {
	_id: 'onoff-story-el-odio',
	title: 'El odio',
	slug: 'el-odio',
	originalPublication: 'Éditions du Méridien (1971)',
	approximateReadingTime: 3,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/el-odio.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1971-01-01T00:00:00Z',
	updatedAt: '1971-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-odio-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-odio-sum-s',
					text: 'El odio aparece allí no como reacción sino como una manera estable de habitar el mundo: un retrato sin concesiones de un sentimiento que la novela se niega a explicar o a redimir.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-odio-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-odio-b1-s',
					text: 'No lo odiaba por algo. Lo odiaba como se respira: sin causa, sin descanso, sin esperanza de catarsis. El odio era la forma estable en que había decidido habitar el mundo, y no pensaba explicárselo a nadie.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-odio-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-odio-b2-s',
					text: 'Lo veía cada mañana cruzar la calle y cada mañana confirmaba la temperatura exacta de mi desprecio: fría, limpia, sin un gramo de fiebre. No había en mí deseo de venganza, solo la satisfacción cortante de seguir odiando bien.',
				},
			],
		},
	],
};

export const elTratadoDeLosPlaceresStoryMock: Story = {
	_id: 'onoff-story-el-tratado-de-los-placeres',
	title: 'El tratado de los placeres',
	slug: 'el-tratado-de-los-placeres',
	originalPublication: 'Éditions du Méridien (1981)',
	approximateReadingTime: 7,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/el-tratado-de-los-placeres.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1981-01-01T00:00:00Z',
	updatedAt: '1981-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-tratado-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-tratado-sum-s',
					text: 'Bajo la apariencia de un inventario ordenado de los placeres —enumerados, glosados, jerarquizados— la obra termina sugiriendo que todo placer catalogado deja de serlo, y que el verdadero objeto del libro es el deseo de clasificar, no lo clasificado.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-tratado-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-tratado-b1-s',
					text: 'Comienzo por el placer más simple y prometo no detenerme hasta haberlos clasificado todos. El primero es el del orden mismo: nombrar, numerar, jerarquizar. Sospecho ya que será también el último.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-tratado-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-tratado-b2-s',
					text: 'Cada placer que ingresa en la lista deja, en el acto, de ser placentero. Lo descubrí tarde, hacia la mitad del tratado: no escribía sobre los placeres sino sobre mi necesidad de clasificarlos. El deseo, comprendí, no soporta el inventario.',
				},
			],
		},
	],
};

export const lasDosAntorchasStoryMock: Story = {
	_id: 'onoff-story-las-dos-antorchas',
	title: 'Las dos antorchas',
	slug: 'las-dos-antorchas',
	originalPublication: 'Éditions du Méridien (1987)',
	approximateReadingTime: 5,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/las-dos-antorchas.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1987-01-01T00:00:00Z',
	updatedAt: '1987-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-antorchas-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-antorchas-sum-s',
					text: 'Dos luces que avanzan en paralelo sin llegar nunca a alumbrar lo mismo: la novela lleva al extremo el procedimiento de las dualidades que atraviesa toda la obra de Onoff.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-antorchas-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-antorchas-b1-s',
					text: 'Las dos antorchas avanzaban en paralelo por el corredor y, aunque iluminaban el mismo muro, nunca alumbraban lo mismo. Una mostraba la piedra; la otra, la sombra de la piedra.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-antorchas-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-antorchas-b2-s',
					text: 'Caminé entre ambas toda la noche sin decidirme. Hacia el alba entendí que no debía elegir: el sentido no estaba en ninguna de las dos luces, sino en la distancia exacta que se negaban a cerrar.',
				},
			],
		},
	],
};

export const neronStoryMock: Story = {
	_id: 'onoff-story-neron',
	title: 'Nerón',
	slug: 'neron',
	originalPublication: 'Estreno teatral (1988)',
	approximateReadingTime: 4,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/neron.svg',
	tags: [],
	resources: [],
	media: [],
	epigraphs: [],
	author: authorMock,
	publishedAt: '1988-01-01T00:00:00Z',
	updatedAt: '1988-01-01T00:00:00Z',
	summary: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-neron-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-neron-sum-s',
					text: 'Tragedia sobre el emperador romano y única pieza escrita para la escena, su estreno marcó el comienzo de los años de silencio: el punto donde Onoff, narrador obsesivo de la palabra escrita, dio el paso a la palabra dicha y encontró su límite.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-neron-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-neron-b1-s',
					text: '—Que ardan —dijo Nerón, y la frase quedó sola en el escenario, sin música, sin gesto, demasiado dicha. El emperador escuchó su propia voz y por primera vez sintió miedo de las palabras que no se escriben.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'onoff-neron-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'onoff-neron-b2-s',
					text: 'Dirigí la obra yo mismo, muy mal, y supe esa noche que no volvería a publicar. Había pasado la vida en la frontera entre lo que se escribe y lo que se calla; al dar el paso a la palabra dicha, encontré por fin el límite. Después vino el silencio, y el silencio fue largo.',
				},
			],
		},
	],
};

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
