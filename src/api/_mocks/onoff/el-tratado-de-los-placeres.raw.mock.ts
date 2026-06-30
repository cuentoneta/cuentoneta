import type { StoryBySlugQueryResult } from '../../sanity/types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';

// Cuerpo replicado verbatim del campo `paragraphs` de src/app/mocks/onoff/el-tratado-de-los-placeres.mock.ts (separación de capas:
// la capa API no importa del frontend). Espeja el shape crudo de GROQ `storyBySlugQuery` (`body` = BlockContent).
export const elTratadoRawStory: NonNullable<StoryBySlugQueryResult> = {
	_id: 'onoff-story-el-tratado-de-los-placeres',
	slug: 'el-tratado-de-los-placeres',
	title: 'El tratado de los placeres',
	badLanguage: false,
	epigraphs: [],
	body: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b1-s1',
					text: 'Conviene advertir, antes de toda enumeración, que un tratado de los placeres no es un repertorio de placeres sino su contrario exacto. Quien escribe ',
				},
				{
					_type: 'span',
					_key: 'tratado-b1-s2',
					text: 'esto',
					marks: ['em'],
				},
				{
					_type: 'span',
					_key: 'tratado-b1-s3',
					text: ' ya ha dejado de gozar; ha pasado al otro lado de la mesa, donde se mide y se nombra.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b2-s1',
					text: 'El primer placer que registramos es el del orden. Lo situamos arriba, no por su intensidad, sino porque preside a los demás: es la voluntad de poner cada cosa en su sitio, de saber dónde duerme cada apetito. Quien lo posee cree dominar a los otros placeres; en rigor, los ha sustituido por su catálogo.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b3',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b3-s1',
					text: 'Sigue el placer de la mesa, que parece concreto y resulta el más huidizo. Lo describimos por sus instrumentos —el peso del cubierto, la temperatura del vino, el orden de los platos— porque el sabor mismo se niega a comparecer. ',
				},
				{
					_type: 'span',
					_key: 'tratado-b3-s2',
					text: 'Nombrar un sabor es ya haberlo perdido.',
					marks: ['strong'],
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b4',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b4-s1',
					text: 'Del placer del cuerpo diremos poco, y ese poco lo diremos en tercera persona, como si le ocurriera a otro. Es la única manera honesta de catalogarlo: el que goza no clasifica, y el que clasifica recuerda. Entre ambos hay una distancia que ningún tratado consigue cerrar.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b5',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b5-s1',
					text: 'Hay un placer menor, casi vergonzante, que es el de la anticipación. Se lo suele confundir con la esperanza, pero la esperanza mira un objeto y la anticipación se contempla a sí misma. Goza de la víspera y teme la fiesta. ',
				},
				{
					_type: 'span',
					_key: 'tratado-b5-s2',
					text: 'Es, quizá, el más fiel de todos: nunca llega tarde porque nunca llega.',
					marks: ['em'],
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b6',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b6-s1',
					text: 'El placer de la conversación merecería un capítulo aparte si no fuera, él mismo, el aparte de todos los demás. Se lo reconoce en que no deja residuo: terminada la charla, no queda nada que pueda guardarse, salvo la certeza de haber estado, por un rato, exento del propio peso.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b7',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b7-s1',
					text: 'Llegamos al placer de la lectura, que es el más sospechoso de cuantos hemos inventariado, porque se disfraza de los otros. El lector cree comer, viajar, amar; en verdad sólo asiste a la descripción de esas cosas. ',
				},
				{
					_type: 'span',
					_key: 'tratado-b7-s2',
					text: 'Quien lee un tratado de los placeres no goza: estudia su propia renuncia.',
					marks: ['strong'],
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b8',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b8-s1',
					text: 'Advierto, hacia la mitad del inventario, que el método se vuelve contra el objeto. Cada placer, en cuanto recibe su número y su definición, se enfría sobre la página como un insecto bajo el alfiler. Conservo la forma; pierdo la criatura.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b9',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b9-s1',
					text: 'Queda, entonces, un solo placer no contaminado por la lista, y es el de hacer la lista. ',
				},
				{
					_type: 'span',
					_key: 'tratado-b9-s2',
					text: 'El deseo de clasificar',
					marks: ['em'],
				},
				{
					_type: 'span',
					_key: 'tratado-b9-s3',
					text: ' sobrevive a todo lo clasificado; es el apetito que se alimenta de los apetitos ajenos y no se sacia con ninguno.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b10',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b10-s1',
					text: 'Por eso este tratado, que prometía un orden, se desordena desde dentro. No falla por exceso ni por defecto, sino por su naturaleza: ',
				},
				{
					_type: 'span',
					_key: 'tratado-b10-s2',
					text: 'toda taxonomía del goce es una manera elegante de no gozar.',
					marks: ['strong'],
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b12',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b12-s1',
					text: 'Hacia el final intenté una entrada nueva, la más ambiciosa: el placer de renunciar a clasificar. Pero apenas lo nombré, ya estaba ',
				},
				{
					_type: 'span',
					_key: 'tratado-b12-s2',
					text: 'dentro del sistema',
					marks: ['em'],
				},
				{
					_type: 'span',
					_key: 'tratado-b12-s3',
					text: ', convertido en una casilla más. No hay afuera del catálogo para quien escribe catálogos.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b13',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b13-s1',
					text: 'Tardé en admitir lo que el cuaderno repetía en cada margen: ',
				},
				{
					_type: 'span',
					_key: 'tratado-b13-s2',
					text: 'el deseo no se deja inventariar sin morir un poco',
					marks: ['strong'],
				},
				{
					_type: 'span',
					_key: 'tratado-b13-s3',
					text: '. Cada definición era una pequeña autopsia, y yo, su forense más fiel.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'tratado-b11',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'tratado-b11-s1',
					text: 'Cierro el cuaderno donde lo abrí. Los placeres siguen, indiferentes a sus nombres, ocurriendo en otra parte, en cuerpos que no leen. Y el clasificador, fiel a su único vicio, levanta la pluma y se queda mirando la página en blanco, que es la antesala de un silencio mucho más grande.',
				},
			],
		},
	],
	review: [],
	originalPublication: 'Éditions du Méridien (1981)',
	publishedAt: '1981-01-01T00:00:00Z',
	updatedAt: '1981-01-01T00:00:00Z',
	approximateReadingTime: 10,
	// REASON: GROQ devuelve null para stories sin imagen; el typegen lo declara non-nullable.
	coverImage: null as unknown as NonNullable<StoryBySlugQueryResult>['coverImage'],
	mediaSources: [],
	resources: [],
	tags: [],
	author: rawOnoffAuthor,
};
