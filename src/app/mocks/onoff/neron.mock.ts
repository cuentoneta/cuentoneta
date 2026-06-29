import type { Story } from '@models/story.model';
import { authorMock } from '../author.mock';

export const neronStoryMock: Story = {
	_id: 'onoff-story-neron',
	title: 'Nerón',
	slug: 'neron',
	originalPublication: 'Estreno teatral (1988)',
	approximateReadingTime: 7,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/neron.png',
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
			_key: 'neron-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-sum-s',
					text: 'Tragedia sobre el emperador romano y única pieza escrita para la escena, su estreno marcó el comienzo de los años de silencio: el punto donde Onoff, narrador obsesivo de la palabra escrita, dio el paso a la palabra dicha y encontró su límite.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b1-s1',
					text: 'Escribí Nerón porque creí, durante algunos meses, que el incendio podía contarse desde adentro. Me equivoqué con método y precisión, que son las dos únicas formas decentes de equivocarse.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b2-s1',
					text: 'Era mi primera obra para la escena, y también la última. Hay decisiones que uno toma una sola vez y que después, vistas a distancia, se parecen demasiado a una ',
				},
				{
					_type: 'span',
					_key: 'neron-b2-s2',
					marks: ['em'],
					text: 'condena',
				},
				{
					_type: 'span',
					_key: 'neron-b2-s3',
					text: ' firmada de antemano.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b3',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b3-s1',
					text: 'En la página, el emperador me obedecía. Cada frase suya era una frase mía dispuesta a ser leída en el orden exacto, sin testigos, sin cuerpos, sin esa humedad insoportable que tiene la voz de los otros.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b4',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b4-s1',
					text: 'La dirigí yo mismo. La dirigí ',
				},
				{
					_type: 'span',
					_key: 'neron-b4-s2',
					marks: ['strong'],
					text: 'muy mal',
				},
				{
					_type: 'span',
					_key: 'neron-b4-s3',
					text: ', con la torpeza desdeñosa del que cree que la escena es apenas una página vertical y respira por error.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b5',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b5-s1',
					text: 'Descubrí entonces, tarde, la diferencia entre la palabra escrita y la palabra dicha. La escrita es mía hasta el punto final. La dicha pertenece, en el instante mismo de pronunciarse, a quien la escucha.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b6',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b6-s1',
					text: 'Yo había construido toda una vida sobre la primera certeza. La frase que se queda quieta, que se relee, que no envejece entre el sujeto y el predicado. La frase ',
				},
				{
					_type: 'span',
					_key: 'neron-b6-s2',
					marks: ['em'],
					text: 'que no respira',
				},
				{
					_type: 'span',
					_key: 'neron-b6-s3',
					text: '.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b7',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b7-s1',
					text: 'En el escenario, en cambio, todo se corrompía a la velocidad de un pulmón. Un actor tomaba mi línea más pulida y la ensuciaba con saliva, con miedo, con su biografía pequeña y ajena a la mía.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b8',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b8-s1',
					text: 'Comprendí que Nerón no incendiaba Roma: incendiaba el silencio. Y que yo, sentado en la última fila, asistía sin entenderlo del todo al incendio de mi propio ',
				},
				{
					_type: 'span',
					_key: 'neron-b8-s2',
					marks: ['strong'],
					text: 'método',
				},
				{
					_type: 'span',
					_key: 'neron-b8-s3',
					text: '.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b9',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b9-s1',
					text: 'Hay un límite, y la noche del estreno lo toqué con las dos manos. El límite no está en lo que uno sabe escribir, sino en lo que uno se niega a entregar a la boca de otro.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b10',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b10-s1',
					text: 'El público aplaudió con cortesía, que es la forma más exacta del desprecio. Yo no quería cortesía. Quería el viejo orden de la página, donde nadie aplaude porque nadie está, y la frase queda sola conmigo.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b11',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b11-s1',
					text: 'Después del estreno vino el silencio. No el silencio del que no tiene nada que decir, sino el del que ha visto, con una claridad ',
				},
				{
					_type: 'span',
					_key: 'neron-b11-s2',
					marks: ['em'],
					text: 'demasiado nítida',
				},
				{
					_type: 'span',
					_key: 'neron-b11-s3',
					text: ', dónde termina aquello que sabe hacer.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b12',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b12-s1',
					text: 'Dejé de escribir como quien deja de respirar a propósito: con una disciplina que los otros confundieron con orgullo, y que era apenas el respeto frío de un hombre por su propia frontera.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b13',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b13-s1',
					text: 'Entre lo que se escribe y lo que se calla pasa una línea fina, y yo aprendí a habitarla. La palabra dicha me había mostrado el abismo; la palabra ',
				},
				{
					_type: 'span',
					_key: 'neron-b13-s2',
					marks: ['strong'],
					text: 'callada',
				},
				{
					_type: 'span',
					_key: 'neron-b13-s3',
					text: ' fue mi última obra, la que nadie dirigió mal porque nadie la dirigió.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'neron-b14',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'neron-b14-s1',
					text: 'De Nerón me queda esto: la certeza de que un imperio se incendia más rápido por dentro, y de que el incendio más callado de todos es el de un hombre que decide, por fin, no decir.',
				},
			],
		},
	],
};
