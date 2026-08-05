import { TextBlockContent } from '@models/block-content.model';

// Prosa biográfica de François Onoff en Portable Text, con las marcas que ejercita el parser:
// `strong` en el nombre y `em` en los títulos de obra. Vive acá y no en el mock de dominio del autor
// porque la biografía de `Author` ya viaja como HTML saneado: este fixture acompaña al parser
// mientras el parser exista.
export const portableTextBiographyMock: TextBlockContent[] = [
	{
		children: [
			{
				_type: 'span',
				marks: ['strong'],
				text: 'François Onoff ',
				_key: 'b2399ab5fba8',
			},
			{
				_type: 'span',
				marks: [],
				text: '(Chateauroux, 1948 - París, 1994) fue un escritor francés, reconocido como uno de los principales exponentes del realismo psicológico en la literatura de finales del siglo XX. La novela ',
				_key: '184064d1e14e',
			},
			{
				_key: 'c8faa6f7502e',
				_type: 'span',
				marks: ['em'],
				text: 'El palacio de las nueve fronteras',
			},
			{
				_type: 'span',
				marks: [],
				text: ' (1990), en la cual realiza una profunda exploración de la psique humana y la ambigüedad de la memoria, lo catapultó a la fama internacional y es considerada su obra maestra.',
				_key: '4a569a405101',
			},
		],
		_type: 'block',
		style: 'normal',
		_key: '55d66b6f6c01',
		markDefs: [],
	},
	{
		markDefs: [],
		children: [
			{
				_type: 'span',
				marks: [],
				text: 'Onoff se destacó por su habilidad para fusionar elementos del thriller psicológico con reflexiones filosóficas sobre la identidad y la percepción de la realidad. Su colección de cuentos ',
				_key: 'a58c717facf60',
			},
			{
				_type: 'span',
				marks: ['em'],
				text: 'Ecos del silencio',
				_key: 'f09f2317edf1',
			},
			{
				_type: 'span',
				marks: [],
				text: ' (1983) mostró por primera vez su talento para crear atmósferas inquietantes y personajes atormentados por sus propios recuerdos.',
				_key: '31a9df1990bc',
			},
		],
		_type: 'block',
		style: 'normal',
		_key: 'cdc729412a8f',
	},
	{
		markDefs: [],
		children: [
			{
				marks: [],
				text: 'Su último manuscrito inacabado, ',
				_key: 'c9ad2571947b0',
				_type: 'span',
			},
			{
				_type: 'span',
				marks: ['em'],
				text: 'Sinfonía de sombras',
				_key: 'd29c792cc843',
			},
			{
				_type: 'span',
				marks: [],
				text: ', fue publicado en 1998 y es considerado por muchos como un testimonio conmovedor de su genio creativo y una visión de la dirección que su escritura podría haber tomado de haber vivido más tiempo.',
				_key: 'f258a3f8d34e',
			},
		],
		_type: 'block',
		style: 'normal',
		_key: '59089d1c58c4',
	},
];
