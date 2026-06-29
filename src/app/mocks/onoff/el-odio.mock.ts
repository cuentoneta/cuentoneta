import type { Story } from '@models/story.model';
import { authorMock } from '../author.mock';

export const elOdioStoryMock: Story = {
	_id: 'onoff-story-el-odio',
	title: 'El odio',
	slug: 'el-odio',
	originalPublication: 'Éditions du Méridien (1971)',
	approximateReadingTime: 6,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/el-odio.png',
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
			_key: 'odio-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-sum-s',
					text: 'El odio aparece allí no como reacción sino como una manera estable de habitar el mundo: un retrato sin concesiones de un sentimiento que la novela se niega a explicar o a redimir.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b1-s1',
					text: 'No empezó por nada. Eso es lo primero que conviene aclarar. No hubo un agravio, ni una herida, ni una infancia que pudiera invocarse después como excusa. El odio estaba ahí desde antes, igual que el peso del cuerpo o el color de los ojos, una propiedad y no un acontecimiento.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b2-s1',
					text: 'La gente cree que odiar quema. Lo dicen así: ',
				},
				{
					_type: 'span',
					_key: 'odio-b2-s2',
					marks: ['em'],
					text: 'arde por dentro, se consume.',
				},
				{
					_type: 'span',
					_key: 'odio-b2-s3',
					text: ' Conmigo no. Lo mío era frío y ordenado, una habitación con los muebles en su sitio. Entraba en ella todas las mañanas y nada se había movido durante la noche.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b3',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b3-s1',
					text: 'A los que me importaban menos los trataba con cortesía. La cortesía es barata y compra tiempo. Sonreía lo justo, recordaba sus nombres, preguntaba por sus hijos. Ninguno sospechó nunca lo que había detrás, y no porque yo lo escondiera, sino porque nadie mira con atención una cara que sonríe.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b4',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b4-s1',
					text: 'Había uno, sin embargo, al que dediqué los años. Lo llamaré ',
				},
				{
					_type: 'span',
					_key: 'odio-b4-s2',
					marks: ['strong'],
					text: 'el hombre',
				},
				{
					_type: 'span',
					_key: 'odio-b4-s3',
					text: ', porque su nombre no agrega nada. Lo elegí como se elige un oficio: con calma, sabiendo que iba a ocuparme de él el resto de mi vida.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b5',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b5-s1',
					text: 'No quería destruirlo. Esa es la confusión más común. La venganza es ruidosa, exige público, necesita un final. Yo no buscaba ningún final. Lo que quería era seguir odiándolo bien, con limpieza, durante mucho tiempo, sin que el sentimiento se gastara ni se ensuciara.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b6',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b6-s1',
					text: 'Lo observaba. Sabía cómo desayunaba, a qué hora salía, de qué lado de la cama dormía. No para hacerle daño. Para conocerlo. Uno no odia de verdad lo que no conoce; lo demás es rencor, y el rencor es vulgar.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b7',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b7-s1',
					text: 'Una vez se enfermó. Estuvo a punto de morirse y yo sentí algo parecido al pánico. No por afecto: ',
				},
				{
					_type: 'span',
					_key: 'odio-b7-s2',
					marks: ['em'],
					text: 'si se moría, me quedaba sin nada.',
				},
				{
					_type: 'span',
					_key: 'odio-b7-s3',
					text: ' Recé, a mi manera, que se curara. Y se curó. Volví a respirar.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b8',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b8-s1',
					text: 'No hay catarsis en esto. Lo advierto porque el lector espera siempre una. Espera que en algún punto yo entienda, que perdone, que me libere. No va a pasar. No tengo nada de qué liberarme. El odio no es una cadena: es una casa, y yo vivo cómodo en ella.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b9',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b9-s1',
					text: 'Tampoco hay fiebre. La fiebre es para los que odian mal, los que gritan y tiemblan y al día siguiente se arrepienten. Yo nunca me arrepentí de nada. Lo que se hace con método no deja resaca.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b10',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b10-s1',
					text: 'Lo que más le molestaba a la gente, cuando intuía algo, era la ausencia de motivo. Querían una razón. ',
				},
				{
					_type: 'span',
					_key: 'odio-b10-s2',
					marks: ['strong'],
					text: 'Una razón los habría tranquilizado.',
				},
				{
					_type: 'span',
					_key: 'odio-b10-s3',
					text: ' Si yo hubiera dicho que él me arruinó, que me traicionó, todos habrían asentido. El odio sin causa, en cambio, los aterra, porque no se sabe dónde termina.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b11',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b11-s1',
					text: 'Envejecimos los dos. Él del lado de su vida, yo del lado de la mía, atado a la suya por un hilo que solo yo veía. Su pelo se volvió blanco. El mío también. No cambió nada esencial.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b12',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b12-s1',
					text: 'Murió un martes, en su cama, sin enterarse de mí. Fui al entierro. Me quedé atrás, donde nadie me viera, y miré bajar el cajón con la atención con que se cierra un libro que uno ha leído muchas veces.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b13',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b13-s1',
					text: 'Esa noche no sentí alivio. Sentí, por primera vez, el frío de la habitación vacía. ',
				},
				{
					_type: 'span',
					_key: 'odio-b13-s2',
					marks: ['em'],
					text: 'Había perdido lo único que había cuidado en mi vida.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'odio-b14',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'odio-b14-s1',
					text: 'Ahora busco a otro. No por necesidad, sino por costumbre, que es una forma más honesta de la necesidad. Hay candidatos. Llevará su tiempo. Estas cosas no se improvisan, y a mí no me queda demasiado.',
				},
			],
		},
	],
};
