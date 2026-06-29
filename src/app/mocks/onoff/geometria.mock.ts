import type { Story } from '@models/story.model';
import { authorMock } from '../author.mock';

export const geometriaStoryMock: Story = {
	_id: 'onoff-story-geometria',
	title: 'Geometría',
	slug: 'geometria',
	originalPublication: 'Éditions du Méridien (1974)',
	approximateReadingTime: 7,
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
			_key: 'geometria-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-sum-s',
					text: 'Shannon, insomne crónico, se despierta cada madrugada exactamente a las tres y media y nunca duerme más de dos horas: una vida reducida a coordenadas, donde el desvelo funciona como una geometría del tiempo que no deja resquicios.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b1-s1',
					text: 'A las tres y media en punto, sin que ningún despertador lo convoque, Shannon abre los ojos. La oscuridad de la habitación tiene siempre el mismo peso, el mismo gramaje exacto, como si la noche hubiera sido recortada con escuadra. No hay sobresalto: hay precisión.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b2-s1',
					text: 'Durante años creyó que padecía un trastorno. Más tarde comprendió que se trataba de otra cosa: ',
				},
				{
					_type: 'span',
					_key: 'geometria-b2-s2',
					marks: ['em'],
					text: 'una vocación involuntaria por la medida',
				},
				{
					_type: 'span',
					_key: 'geometria-b2-s3',
					text: '. El cuerpo se había vuelto instrumento, y el tiempo, materia que podía trazarse.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b3',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b3-s1',
					text: 'Se incorporaba sin encender la luz. Conocía la distancia entre la cama y la ventana con una certeza que no admitía error: once pasos, ni uno más. El piso frío bajo los pies descalzos era la primera coordenada de la madrugada.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b4',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b4-s1',
					text: 'Dormía, a lo sumo, dos horas. Lo sabía no por reloj sino por una aritmética interna, exacta e inflexible. ',
				},
				{
					_type: 'span',
					_key: 'geometria-b4-s2',
					marks: ['strong'],
					text: 'El sueño era un segmento, no un océano',
				},
				{
					_type: 'span',
					_key: 'geometria-b4-s3',
					text: ': tenía principio, fin y una longitud que jamás se desbordaba.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b5',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b5-s1',
					text: 'En la cocina, a oscuras, trazaba con la mente el perímetro de la mesa. Calculaba ángulos, hipotenusas imaginarias, la diagonal exacta que iba del picaporte a la silla. El insomnio le había enseñado que todo objeto encierra un teorema.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b6',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b6-s1',
					text: 'Los vecinos dormían el sueño informe de los que no miden. Shannon los compadecía un poco. ',
				},
				{
					_type: 'span',
					_key: 'geometria-b6-s2',
					marks: ['em'],
					text: 'Ellos atravesaban la noche como quien cae; él la recorría como quien dibuja',
				},
				{
					_type: 'span',
					_key: 'geometria-b6-s3',
					text: '.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b7',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b7-s1',
					text: 'Tenía cuadernos llenos de horarios. No anotaba pensamientos ni recuerdos: anotaba cifras. La hora de despertar, la duración del desvelo, los minutos que tardaba el agua en hervir. Su biografía era una tabla de coordenadas sin una sola palabra.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b8',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b8-s1',
					text: 'A veces se preguntaba qué habría al otro lado de la regularidad. ',
				},
				{
					_type: 'span',
					_key: 'geometria-b8-s2',
					marks: ['strong'],
					text: 'Una madrugada sin medida le parecía tan inconcebible como una recta sin dirección',
				},
				{
					_type: 'span',
					_key: 'geometria-b8-s3',
					text: '. La sola idea le producía un vértigo limpio, casi geométrico.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b9',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b9-s1',
					text: 'La ventana daba a un patio interior donde la luna, cuando aparecía, proyectaba sombras de una nitidez quirúrgica. Shannon estudiaba esas sombras como un cartógrafo: sabía a qué hora la diagonal del marco tocaría el borde exacto de la baldosa.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b10',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b10-s1',
					text: 'No se aburría. El aburrimiento, pensaba, es de quienes no observan. Él tenía un mundo entero que medir: el goteo de un grifo, la dilatación del frío, ',
				},
				{
					_type: 'span',
					_key: 'geometria-b10-s2',
					marks: ['em'],
					text: 'la lentísima rotación de la madrugada sobre su propio eje',
				},
				{
					_type: 'span',
					_key: 'geometria-b10-s3',
					text: '.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b11',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b11-s1',
					text: 'Cuando al fin volvía a la cama, ya cerca del amanecer, lo hacía con la satisfacción serena de quien ha completado una figura. El desvelo había sido trazado de extremo a extremo, sin un solo punto fuera de lugar.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b12',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b12-s1',
					text: 'El día, en cambio, le resultaba impreciso, lleno de horarios elásticos y conversaciones sin escuadra. ',
				},
				{
					_type: 'span',
					_key: 'geometria-b12-s2',
					marks: ['strong'],
					text: 'Solo en la madrugada el mundo aceptaba ser medido',
				},
				{
					_type: 'span',
					_key: 'geometria-b12-s3',
					text: ', y por eso esperaba cada noche, sin temor, el llamado puntual de las tres y media.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'geometria-b13',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'geometria-b13-s1',
					text: 'No le pediría a nadie que lo entendiera. Su manía horaria no era una enfermedad ni un castigo: era una forma de mirar. Una geometría exacta del tiempo donde, por fin, todo coincidía consigo mismo.',
				},
			],
		},
	],
};
