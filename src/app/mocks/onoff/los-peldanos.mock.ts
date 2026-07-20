import type { Story } from '@models/story.model';
import { authorMock } from '../author.mock';
import { absurdoTagMock, cuentoTagMock, surrealismoTagMock } from '../onoff-tags.mock';

export const losPeldanosStoryMock: Story = {
	_id: 'onoff-story-los-peldanos',
	title: 'Los peldaños',
	slug: 'los-peldanos',
	originalPublication: 'Éditions du Méridien (1977)',
	approximateReadingTime: 8,
	badLanguage: false,
	coverImage: 'assets/img/mocks/stories/los-peldanos.png',
	tags: [cuentoTagMock, absurdoTagMock, surrealismoTagMock],
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
			_key: 'peldanos-sum',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-sum-s',
					text: 'La Sra. Oneiras saca del bolsillo de la falda un trozo de pescado hervido y lo come mirando fijamente al frente, sin ver nada, y luego pasa a un centímetro del protagonista como si no existiese. Subir y bajar peldaños es menos un desplazamiento físico que un estado de ánimo.',
				},
			],
		},
	],
	paragraphs: [
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b1',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b1-s1',
					text: 'La escalera empezaba en ninguna parte y terminaba un poco más arriba de eso. La Sra. Oneiras vivía en alguno de sus peldaños, aunque jamás conseguí determinar en cuál, porque cada vez que creía haberlo hecho el peldaño se desplazaba, o yo me desplazaba, o el día entero cambiaba de número sin avisarle a nadie.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b2',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b2-s1',
					text: 'A las nueve, o a una hora que ocupaba el lugar de las nueve, sacaba del bolsillo de la falda un trozo de pescado hervido. Lo comía con una lentitud sin hambre, mirando fijamente el aire que tenía delante, ',
				},
				{
					_type: 'span',
					_key: 'peldanos-b2-s2',
					marks: ['em'],
					text: 'como si en ese aire hubiera otra escalera que sólo ella supiera subir.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b3',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b3-s1',
					text: 'Yo subía hacia ella. Ella no subía hacia mí. Eran dos hechos que no se tocaban en ningún punto, dos líneas paralelas que alguien, por economía, había decidido dibujar en la misma página.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b4',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b4-s1',
					text: 'Cuando pasaba a mi lado lo hacía a un centímetro exacto, ni más ni menos, con la precisión de quien ha medido tantas veces el vacío que ya no necesita mirarlo. ',
				},
				{
					_type: 'span',
					_key: 'peldanos-b4-s2',
					marks: ['strong'],
					text: 'No me veía.',
				},
				{
					_type: 'span',
					_key: 'peldanos-b4-s3',
					text: ' No es que me ignorara: ignorar exige reconocer primero, y ese trabajo previo ella nunca lo hacía.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b5',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b5-s1',
					text: 'Comprendí, con el tiempo que allí no avanzaba, que subir y bajar peldaños no era para ella un desplazamiento. Era un estado de ánimo. Bajaba cuando estaba triste y subía cuando la tristeza, cansada, se volvía costumbre.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b6',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b6-s1',
					text: 'Una tarde le hablé. Las palabras salieron de mí, cruzaron el centímetro reglamentario y se quedaron flotando en el rellano, ',
				},
				{
					_type: 'span',
					_key: 'peldanos-b6-s2',
					marks: ['em'],
					text: 'mojadas, inútiles, como peces devueltos al aire en lugar de al agua.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b7',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b7-s1',
					text: 'Su nombre, me dijeron en el descansillo, venía de una lengua antigua donde significaba sueño. Por eso, supuse, dormía despierta y caminaba dormida, y por eso su pescado hervido sabía siempre a una comida que se come en otro cuarto.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b8',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b8-s1',
					text: 'Hubo un día, o lo que el edificio llamaba día, en que conté los peldaños. Eran ',
				},
				{
					_type: 'span',
					_key: 'peldanos-b8-s2',
					marks: ['strong'],
					text: 'diecisiete',
				},
				{
					_type: 'span',
					_key: 'peldanos-b8-s3',
					text: ' al subir y catorce al bajar, y nadie en la casa encontró eso digno de alarma, salvo yo, que ya empezaba a no pertenecer del todo a mí mismo.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b9',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b9-s1',
					text: 'La Sra. Oneiras no cerraba nunca la boca del todo. Por la rendija se le escapaba un aire frío que olía a mar de invierno, y ese aire, decían los otros inquilinos, era lo único suyo que de verdad existía.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b10',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b10-s1',
					text: 'Intenté seguirla una vez hasta arriba. Subí los diecisiete peldaños y, al llegar, ',
				},
				{
					_type: 'span',
					_key: 'peldanos-b10-s2',
					marks: ['em'],
					text: 'no había arriba.',
				},
				{
					_type: 'span',
					_key: 'peldanos-b10-s3',
					text: ' Había, en cambio, otro tramo idéntico, y al final de ese tramo ella, comiendo el mismo trozo de pescado por primera vez de nuevo.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b11',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b11-s1',
					text: 'Aprendí a no esperar que me devolviera la mirada. Uno no le pide a una escalera que lo recuerde; uno sube, y si la escalera es amable, lo deja llegar a otra parte de sí mismo.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b12',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b12-s1',
					text: 'La última vez que la vi bajaba muy despacio, con el trozo de pescado intacto en la mano, ',
				},
				{
					_type: 'span',
					_key: 'peldanos-b12-s2',
					marks: ['strong'],
					text: 'sin estado de ánimo alguno',
				},
				{
					_type: 'span',
					_key: 'peldanos-b12-s3',
					text: ', como quien ha descubierto que también la tristeza tiene un fondo y que ese fondo, igual que el resto, no lleva a ningún sitio.',
				},
			],
		},
		{
			_type: 'block',
			style: 'normal',
			_key: 'peldanos-b13',
			markDefs: [],
			children: [
				{
					_type: 'span',
					_key: 'peldanos-b13-s1',
					text: 'Ahora soy yo quien vive en un peldaño que no consigo precisar. A veces, al pasar, alguien me habla a un centímetro de la oreja y yo no lo veo, y entiendo, demasiado tarde y de un modo que ya no me sirve, qué clase de sueño era ella.',
				},
			],
		},
	],
};
