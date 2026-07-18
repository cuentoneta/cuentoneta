import type { Story } from '@models/story.model';
import { authorMock } from '../author.mock';
import { absurdoTagMock, alegoriaTagMock, novelaTagMock } from '../onoff-tags.mock';

export const lasEscalerasStoryMock: Story = {
	_id: 'onoff-story-las-escaleras',
	title: 'Las escaleras',
	slug: 'las-escaleras',
	originalPublication: 'Éditions du Méridien (1979)',
	approximateReadingTime: 9,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/las-escaleras.png',
	tags: [novelaTagMock, absurdoTagMock, alegoriaTagMock],
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
			_key: 'escaleras-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-sum-s',
					text: 'Su tercer capítulo, «El regreso del druso», contiene el discurso del príncipe Cosme antes de colocar los mosaicos: un parque poblado de hombres arrodillados y bailarines abandonados, con frescos de figuras en cuclillas en la sombra.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b1-s1',
					text: 'Dos años después la encontré donde la había dejado, al pie de la escalera, midiendo con el pulgar la distancia exacta que separaba un peldaño del siguiente. La Sra. Oneiras no había envejecido; se había vuelto más precisa, como una cifra que se repite hasta perder su sentido.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b2-s1',
					text: 'Me dijo que había aprendido a subir sin tocar la baranda y que eso, en su geometría privada, equivalía a un perdón. Yo no entendí, pero anoté la frase ',
				},
				{
					_type: 'span',
					_key: 'escaleras-b2-s2',
					text: 'subir sin tocar la baranda',
					marks: ['em'],
				},
				{
					_type: 'span',
					_key: 'escaleras-b2-s3',
					text: ' en el reverso de un billete que ya no servía para ningún tranvía.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b3',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b3-s1',
					text: 'El edificio tenía trece escaleras y ninguna conducía a un piso distinto. Eran trece maneras de quedarse en el mismo sitio, trece insistencias del mármol sobre la misma idea fría: que ascender y permanecer son, vistos desde arriba, el mismo gesto.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b4',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b4-s1',
					text: 'El tercer capítulo del libro que ella sostenía se titulaba ',
				},
				{
					_type: 'span',
					_key: 'escaleras-b4-s2',
					text: 'El regreso del druso',
					marks: ['strong'],
				},
				{
					_type: 'span',
					_key: 'escaleras-b4-s3',
					text: ', y allí, entre dos descripciones de polvo, hablaba el príncipe Cosme la víspera de colocar los mosaicos.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b5',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b5-s1',
					text: 'El príncipe Cosme imaginaba un parque poblado de hombres arrodillados, cada uno fijado en su acto de devoción como un insecto en ámbar, y entre ellos bailarines abandonados a mitad de un giro que ya nadie recordaría haber pedido.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b6',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b6-s1',
					text: 'En las paredes del fondo, dijo el príncipe, irían los frescos: ',
				},
				{
					_type: 'span',
					_key: 'escaleras-b6-s2',
					text: 'figuras en cuclillas en la sombra',
					marks: ['em'],
				},
				{
					_type: 'span',
					_key: 'escaleras-b6-s3',
					text: ', tan quietas que el visitante dudaría si esperan algo o si ya lo han recibido y guardan silencio por cortesía.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b7',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b7-s1',
					text: 'La Sra. Oneiras leyó ese discurso en voz alta, sin levantar la vista, y cuando llegó a la palabra ',
				},
				{
					_type: 'span',
					_key: 'escaleras-b7-s2',
					text: 'mosaicos',
					marks: ['strong'],
				},
				{
					_type: 'span',
					_key: 'escaleras-b7-s3',
					text: ' hizo una pausa exacta, como si entre dos teselas cupiera todo lo que no nos habíamos dicho en dos años.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b8',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b8-s1',
					text: 'Comprendí entonces que el libro y la escalera eran un díptico del desencuentro: en un panel, el príncipe ordenaba un jardín que nunca pisaría; en el otro, nosotros subíamos hacia una conversación que ya había terminado antes de empezar.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b9',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b9-s1',
					text: 'Los hombres arrodillados del fresco imaginario se parecían a nosotros más de lo que ella habría tolerado admitir: fijados en una postura de espera, devotos de una cosa que no llegaba, decentes y vencidos a la vez.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b10',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b10-s1',
					text: 'Le pregunté si los bailarines abandonados volverían alguna vez al compás. Respondió que un bailarín abandonado no es el que dejó de bailar, sino ',
				},
				{
					_type: 'span',
					_key: 'escaleras-b10-s2',
					text: 'aquel a quien la música dejó de mirar',
					marks: ['em'],
				},
				{
					_type: 'span',
					_key: 'escaleras-b10-s3',
					text: ', y cerró el libro con la cautela de quien clausura un parque al anochecer.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b11',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b11-s1',
					text: 'La ruptura no tuvo escena. Fue una sustracción: un peldaño que dejó de existir entre nosotros sin que ninguno lo viera caer, y de pronto había un tramo más largo, una sombra donde antes apoyábamos el pie con confianza.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'escaleras-b12',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'escaleras-b12-s1',
					text: 'Bajó la Sra. Oneiras los trece tramos sin tocar la baranda, fiel hasta el final a su único perdón disponible. Yo me quedé arriba, entre las ',
				},
				{
					_type: 'span',
					_key: 'escaleras-b12-s2',
					text: 'figuras en cuclillas',
					marks: ['strong'],
				},
				{
					_type: 'span',
					_key: 'escaleras-b12-s3',
					text: ' que el príncipe Cosme nunca llegó a colocar, esperando que la sombra terminara de cubrir el díptico.',
				},
			],
		},
	],
};
