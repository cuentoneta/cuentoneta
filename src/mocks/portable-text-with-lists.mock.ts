import { TextBlockContent } from '@models/block-content.model';

// Mock de Portable Text con contenido de listas
// Contiene texto con párrafos, listas sin ordenar (bullet) y listas ordenadas (number)
// Basado en la información de participación en "Misceláneas Tertulianas"
export const portableTextWithListsMock: TextBlockContent[] = [
	{
		_key: '3aa7edf5b025',
		_type: 'block',
		children: [
			{
				_key: '824233b8e165',
				_type: 'span',
				marks: ['em'],
				text: 'Misceláneas tertulianas ',
			},
			{
				_key: '102e1d5f1f2e',
				_type: 'span',
				marks: [],
				text: 'es una antología literaria, pública, de temática abierta, conformada voluntariamente por escritos pertenecientes a integrantes de ',
			},
			{
				_key: '37c789df3de2',
				_type: 'span',
				marks: ['38c0e08fd1e8'],
				text: 'Tertulia Literaria',
			},
			{
				_key: '461d9fdc4d32',
				_type: 'span',
				marks: [],
				text: '. Este proyecto busca asentar la presencia literaria de Tertulia Literaria y dar visibilidad a los distintos escritores del servidor. La antología, en este sentido, abarca los géneros narrativo, lírico, dramático y didáctico.',
			},
		],
		markDefs: [
			{
				_key: '38c0e08fd1e8',
				_type: 'link',
				href: 'https://discord.com/invite/tertulia-literaria-795704695485235231',
			},
		],
		style: 'normal',
	},
	{
		_key: '84e5f4b156c2',
		_type: 'block',
		children: [
			{
				_key: 'd6afc9b5d3fe',
				_type: 'span',
				marks: [],
				text: 'La primera versión se publicó el cuatro de junio de 2025. De momento, la antología permanece abierta y suma los escritos aceptados el primer día de cada mes. Tertulia Literaria agradece la participación de los autores que conforman ',
			},
			{
				_key: '49fed675a5ac',
				_type: 'span',
				marks: ['em'],
				text: 'Misceláneas Tertulianas',
			},
			{
				_key: '552f1301cc10',
				_type: 'span',
				marks: [],
				text: '.',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '1f0d92ce991a',
		_type: 'block',
		children: [
			{
				_key: '734f782b82aa',
				_type: 'span',
				marks: ['strong'],
				text: 'Información pertinente para participar',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'd368d9b3e4a7',
		_type: 'block',
		children: [
			{
				_key: '9eb211e4e347',
				_type: 'span',
				marks: ['em'],
				text: 'Requisitos generales:',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '38a681ca845e',
		_type: 'block',
		children: [
			{
				_key: 'd86c99c1fe0a',
				_type: 'span',
				marks: [],
				text: 'Ser miembro del servidor de ',
			},
			{
				_key: '74b1bfbdc6b2',
				_type: 'span',
				marks: ['415ed651d220'],
				text: 'Discord de Tertulia Literaria',
			},
			{
				_key: '53d39f37d273',
				_type: 'span',
				marks: [],
				text: ' al momento de presentar el escrito.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [
			{
				_key: '415ed651d220',
				_type: 'link',
				href: 'https://discord.com/invite/tertulia-literaria-795704695485235231',
			},
		],
		style: 'normal',
	},
	{
		_key: '304d179d0174',
		_type: 'block',
		children: [
			{
				_key: '6c60b702ecb5',
				_type: 'span',
				marks: [],
				text: 'No haber alcanzado el límite de dos escritos publicados en la antología (de ser el caso, es posible intercambiar los escritos publicados).',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'fb78c3e4d45c',
		_type: 'block',
		children: [
			{
				_key: 'a0634a64b7df',
				_type: 'span',
				marks: [],
				text: 'No haber empleado IA para la creación del escrito.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'f00b0ef3d110',
		_type: 'block',
		children: [
			{
				_key: '94155f6a8eb3',
				_type: 'span',
				marks: [],
				text: 'No haber incurrido en plagio ni usado personajes protegidos sin autorización.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '5b2c8d5307e2',
		_type: 'block',
		children: [
			{
				_key: '21a4d32fda2b',
				_type: 'span',
				marks: ['em'],
				text: 'Requisitos de formato:',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'e6aa5c22ed62',
		_type: 'block',
		children: [
			{
				_key: '1f83a6a66a96',
				_type: 'span',
				marks: [],
				text: 'Longitud para prosa: de 40 a 5,500 palabras.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'e243a184f155',
		_type: 'block',
		children: [
			{
				_key: '77614d229df1',
				_type: 'span',
				marks: [],
				text: 'Longitud para verso: de 3 a 150 versos.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '1d80e2e39fdd',
		_type: 'block',
		children: [
			{
				_key: '204fcad72c5e',
				_type: 'span',
				marks: [],
				text: 'Formato del documento: DOCX o, en su defecto, PDF.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'a297ad9b9da6',
		_type: 'block',
		children: [
			{
				_key: 'c20266f93abc',
				_type: 'span',
				marks: ['em'],
				text: 'De la recepción:',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'e4dc04609538',
		_type: 'block',
		children: [
			{
				_key: '0f26997a98b6',
				_type: 'span',
				marks: [],
				text: 'Enviar el escrito en el plazo del 01 al 20 de cada mes a ',
			},
			{
				_key: 'f1e32665a269',
				_type: 'span',
				marks: ['em'],
				text: 'A. Elk',
			},
			{
				_key: '725afb7cc1c2',
				_type: 'span',
				marks: [],
				text: ', ',
			},
			{
				_key: 'efdb1f9a7097',
				_type: 'span',
				marks: ['em'],
				text: 'DemonStrike777',
			},
			{
				_key: '8399fb6e8e05',
				_type: 'span',
				marks: [],
				text: ' o ',
			},
			{
				_key: '1441aa84b448',
				_type: 'span',
				marks: ['em'],
				text: 'Cardenio',
			},
			{
				_key: '32eb336926ca',
				_type: 'span',
				marks: [],
				text: '.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '9465a36d95ff',
		_type: 'block',
		children: [
			{
				_key: '189040a87324',
				_type: 'span',
				marks: ['em'],
				text: 'De la aceptación:',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '7e29c58c9b11',
		_type: 'block',
		children: [
			{
				_key: '71855da30416',
				_type: 'span',
				marks: [],
				text: 'Un comité interno de calidad deberá emitir su aprobación para la aceptación de los escritos participantes; los criterios básicos de evaluación son una gramática y ortografía decentes.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'f290f6cae1f7',
		_type: 'block',
		children: [
			{
				_key: 'bdf39ad4b1e6',
				_type: 'span',
				marks: [],
				text: 'Los escritos aprobados se sumarán a la antología a más tardar el día primero de cada mes.',
			},
		],
		level: 1,
		listItem: 'bullet',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: '58d17bea2bb2',
		_type: 'block',
		children: [
			{
				_key: '4c158fa935dc',
				_type: 'span',
				marks: [],
				text: '(Aclaración: no es necesario que el escrito participante sea inédito).',
			},
		],
		markDefs: [],
		style: 'normal',
	},
];

// Mock simple de lista ordenada para pruebas
// Contiene un encabezado seguido de tres elementos numerados
export const simpleOrderedListMock: TextBlockContent[] = [
	{
		_key: 'heading-1',
		_type: 'block',
		children: [
			{
				_key: 'span-1',
				_type: 'span',
				marks: [],
				text: 'How to write a story:',
			},
		],
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'list-item-1',
		_type: 'block',
		children: [
			{
				_key: 'span-2',
				_type: 'span',
				marks: [],
				text: 'Plan your story structure',
			},
		],
		level: 1,
		listItem: 'number',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'list-item-2',
		_type: 'block',
		children: [
			{
				_key: 'span-3',
				_type: 'span',
				marks: [],
				text: 'Develop your characters',
			},
		],
		level: 1,
		listItem: 'number',
		markDefs: [],
		style: 'normal',
	},
	{
		_key: 'list-item-3',
		_type: 'block',
		children: [
			{
				_key: 'span-4',
				_type: 'span',
				marks: [],
				text: 'Write the first draft',
			},
		],
		level: 1,
		listItem: 'number',
		markDefs: [],
		style: 'normal',
	},
];
