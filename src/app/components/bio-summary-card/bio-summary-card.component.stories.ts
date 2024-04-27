import { Meta } from '@storybook/angular';
import { BioSummaryCardComponent } from './bio-summary-card.component';

export default {
	title: 'BioSummaryCardComponent',
	component: BioSummaryCardComponent,
} as Meta<BioSummaryCardComponent>;

export const Primary = {
	render: (args: BioSummaryCardComponent) => ({
		props: args,
	}),
	args: {
		story: {
			badLanguage: null,
			approximateReadingTime: 9,
			language: 'es',
			title: 'Los Reyes Magos, los Hombres Sensibles y los Refutadores de Leyendas',
			videoUrl: null,
			categories: null,
			resources: [
				{
					title: 'Enlace a recurso original',
					url: null,
					resourceType: {
						title: 'Recurso Original',
						description: 'Recurso original de este contenido',
						icon: {
							name: 'fa-medal',
							svg: 'data:image/svg+xml,<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path d="M223.75 130.75L154.62 15.54A31.997 31.997 0 0 0 127.18 0H16.03C3.08 0-4.5 14.57 2.92 25.18l111.27 158.96c29.72-27.77 67.52-46.83 109.56-53.39zM495.97 0H384.82c-11.24 0-21.66 5.9-27.44 15.54l-69.13 115.21c42.04 6.56 79.84 25.62 109.56 53.38L509.08 25.18C516.5 14.57 508.92 0 495.97 0zM256 160c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm92.52 157.26l-37.93 36.96 8.97 52.22c1.6 9.36-8.26 16.51-16.65 12.09L256 393.88l-46.9 24.65c-8.4 4.45-18.25-2.74-16.65-12.09l8.97-52.22-37.93-36.96c-6.82-6.64-3.05-18.23 6.35-19.59l52.43-7.64 23.43-47.52c2.11-4.28 6.19-6.39 10.28-6.39 4.11 0 8.22 2.14 10.33 6.39l23.43 47.52 52.43 7.64c9.4 1.36 13.17 12.95 6.35 19.59z"></path></svg>',
							provider: 'fa',
						},
					},
				},
			],
			slug: 'los-reyes-magos-los-hombres-sensibles-y-los-refutadores-de-leyendas',
			media: [],
			author: {
				id: 'c42aabdc-8b18-45ae-9338-6fe8f7b7f279',
				nationality: {
					country: 'Argentina',
					flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ee6f30199738f983516909a0d6330301573a62f6-32x20.png',
				},
				resources: [
					{
						title: 'Artículo de Alejandro Dolina en Wikipedia',
						url: null,
						resourceType: {
							title: 'Wikipedia',
							description: 'Enlace a artículo de Wikipedia',
							icon: {
								name: 'fa-wikipedia-w',
								svg: 'data:image/svg+xml,<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path d="M640 51.2l-.3 12.2c-28.1.8-45 15.8-55.8 40.3-25 57.8-103.3 240-155.3 358.6H415l-81.9-193.1c-32.5 63.6-68.3 130-99.2 193.1-.3.3-15 0-15-.3C172 352.3 122.8 243.4 75.8 133.4 64.4 106.7 26.4 63.4.2 63.7c0-3.1-.3-10-.3-14.2h161.9v13.9c-19.2 1.1-52.8 13.3-43.3 34.2 21.9 49.7 103.6 240.3 125.6 288.6 15-29.7 57.8-109.2 75.3-142.8-13.9-28.3-58.6-133.9-72.8-160-9.7-17.8-36.1-19.4-55.8-19.7V49.8l142.5.3v13.1c-19.4.6-38.1 7.8-29.4 26.1 18.9 40 30.6 68.1 48.1 104.7 5.6-10.8 34.7-69.4 48.1-100.8 8.9-20.6-3.9-28.6-38.6-29.4.3-3.6 0-10.3.3-13.6 44.4-.3 111.1-.3 123.1-.6v13.6c-22.5.8-45.8 12.8-58.1 31.7l-59.2 122.8c6.4 16.1 63.3 142.8 69.2 156.7L559.2 91.8c-8.6-23.1-36.4-28.1-47.2-28.3V49.6l127.8 1.1.2.5z"></path></svg>',
								provider: 'fa',
							},
						},
					},
				],
				imageUrl:
					'https://cdn.sanity.io/images/s4dbqkc5/production/c91d9010f27d5078ef787cb231395042b66db2cd-400x400.jpg',
				name: 'Alejandro Dolina',
				biography: [
					{
						markDefs: [],
						children: [
							{
								text: 'Alejandro Dolina',
								_key: 'ISAWDRYyMzcK9mJWmSbie8QpuBaABLAS',
								_type: 'span',
								marks: ['strong'],
							},
							{
								_type: 'span',
								marks: [],
								text: ' (Morse, 1944) es un músico, conductor de radio y televisión, actor y escritor argentino. Es conocido en su país natal por sus obras literarias y por su clásico programa radial ',
								_key: '7dd7964b9595',
							},
							{
								text: 'La Venganza Será Terrible',
								_key: '0d8eb948f0f7',
								_type: 'span',
								marks: ['em'],
							},
							{
								_type: 'span',
								marks: [],
								text: ', el cual lleva más de cuatro décadas al aire.',
								_key: 'deb865e7ffa2',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: 'IlPqmv3xPO00klzBVlmd6bpjCdg1AUYk',
					},
					{
						markDefs: [],
						children: [
							{
								marks: [],
								text: 'Su narrativa abarca temas filosóficos e históricos, con un estilo costumbrista, en la que pueden observarse influencias borgeanas y de la literatura fantástica. Entre sus obras más destacadas se encuentran los libros de relatos ',
								_key: 'b19bcb282046',
								_type: 'span',
							},
							{
								_key: 'cd1f9046ce20',
								_type: 'span',
								marks: ['em'],
								text: 'Las Crónicas del Ángel Gris',
							},
							{
								_type: 'span',
								marks: [],
								text: ' (1988) y ',
								_key: 'd31228922367',
							},
							{
								text: 'El Libro del Fantasma',
								_key: '7f2f1959a5b7',
								_type: 'span',
								marks: ['em'],
							},
							{
								_type: 'span',
								marks: [],
								text: ' (1999) y su novela ',
								_key: '3aba9bcea6be',
							},
							{
								_type: 'span',
								marks: ['em'],
								text: 'Cartas Marcadas',
								_key: 'd97f808abfae',
							},
							{
								_type: 'span',
								marks: [],
								text: ' (2012).',
								_key: 'c724fcff30ba',
							},
						],
						_type: 'block',
						style: 'normal',
						_key: '127a6271f344',
					},
				],
			},
			epigraphs: [],
			paragraphs: [],
			summary: [
				{
					_key: '7eddf102184a',
					markDefs: [],
					children: [
						{
							_type: 'span',
							marks: ['strong', 'em'],
							text: 'Máscaras',
							_key: 'f043f548f8c4',
						},
						{
							_type: 'span',
							marks: [],
							text: ' está incluido en el volumen ',
							_key: '7b11663f0e03',
						},
						{
							text: 'Bar del Infierno',
							_key: '3ddad9aa76c3',
							_type: 'span',
							marks: ['em'],
						},
						{
							_type: 'span',
							marks: [],
							text: ', publicado en 2005. La acción de la obra se sucede en un bar del cual no es posible salir, dado que en el universo del libro el afuera no existe. En este escenario, El Narrador de Historias, protagonista principal de esta narración enmarcada, procede a contar una variedad de relatos ubicados en distintos lugares y distintas épocas.',
							_key: 'afc1b9c43d8c',
						},
					],
					_type: 'block',
					style: 'normal',
				},
			],
		},
	},
};
