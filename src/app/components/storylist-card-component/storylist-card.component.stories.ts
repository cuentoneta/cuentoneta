import { Meta, moduleMetadata } from '@storybook/angular';
import { StorylistCardComponent } from './storylist-card.component';
import { NgOptimizedImage } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { StorylistCardSkeletonComponent } from './storylist-card-skeleton.component';

const storylist1 = {
	count: 60,
	title: 'La Cuentoneta 1.0',
	description: [
		{
			_key: '58f75b67346a',
			markDefs: [],
			children: [
				{
					_key: 'e846ec598eb60',
					_type: 'span',
					marks: [],
					text: 'La colección de cuentos de la primera versión de La Cuentoneta, publicados diariamente entre el Año Nuevo y el Martes de Carnaval de 2022. Esta colección consiste de sesenta textos, todos ellos de diferentes autores.',
				},
			],
			_type: 'block',
			style: 'normal',
		},
	],
	displayDates: true,
	editionPrefix: 'Día',
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/development/d1a7fc995e0a4d640c9d8e98fb56f56f209f3d89-392x318.webp',
	publications: [],
	slug: 'verano-2022',
	language: 'es',
	comingNextLabel: 'Próximamente',
	tags: [
		{
			shortDescription: 'Selección de textos a cargo del staff de La Cuentoneta.',
			description: [
				{
					style: 'normal',
					_key: '6af1079cc442',
					markDefs: [],
					children: [
						{
							_type: 'span',
							marks: [],
							text: 'Selección de textos a cargo del staff de La Cuentoneta.',
							_key: '9ab33363f0570',
						},
					],
					_type: 'block',
				},
			],
			icon: {
				provider: 'mdi',
				name: 'stars',
			},
			title: 'Curaduría',
			slug: 'curaduria',
		},
	],
};
const storylist2 = {
	slug: 'fec-english-sessions',
	count: 13,
	displayDates: false,
	title: 'FEC English Sessions',
	editionPrefix: '',
	comingNextLabel: 'Próximamente',
	description: [
		{
			_key: '58f75b67346a',
			markDefs: [],
			children: [
				{
					_key: 'e846ec598eb60',
					_type: 'span',
					marks: [],
					text: 'Material para uso del English Study Group de FrontendCafé. Mediante estas historias disparamos charlas y practicamos nuestro reading en las sesiones virtuales de los Martes y Jueves.',
				},
			],
			_type: 'block',
			style: 'normal',
		},
	],
	publications: [],
	featuredImage:
		'https://cdn.sanity.io/images/s4dbqkc5/development/f6be445b251ce65a33721605303069659997bfbf-602x240.jpg?w=2000&fit=max&auto=format',
	tags: [
		{
			title: 'Colaborativa',
			slug: 'colaborativa',
			description: 'Lista de textos generada colaborativamente por la comunidad',
			icon: {
				name: 'stars',
				provider: 'mdi',
			},
		},
		{
			title: 'Inglés',
			slug: 'ingles',
			description: 'Textos íntegramente en idioma inglés',
			icon: {
				name: 'people',
				provider: 'mdi',
			},
		},
	],
};

const meta: Meta<StorylistCardComponent> = {
	component: StorylistCardComponent,
	title: 'StorylistCardComponent',
	decorators: [
		moduleMetadata({
			imports: [NgOptimizedImage, RouterTestingModule, StorylistCardSkeletonComponent],
		}),
	],
};
export default meta;

export const Primary = {
	render: (args: StorylistCardComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-4">
          <cuentoneta-storylist-card class="card" [storylist]="storylist"/>
          <cuentoneta-storylist-card-skeleton class="card w-full"/>
    </div>
`,
	}),
	args: {
		storylist: storylist1,
	},
};

export const Loaded = {
	render: (args: StorylistCardComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-4">
          <cuentoneta-storylist-card class="card" [storylist]="storylist1"/>
          <cuentoneta-storylist-card class="card" [storylist]="storylist2"/>
    </div>
`,
	}),
	args: {
		storylist1: storylist1,
		storylist2: storylist2,
	},
};

export const Loading = {
	render: (args: StorylistCardComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-4">
          <cuentoneta-storylist-card-skeleton class="card w-full"/>
          <cuentoneta-storylist-card-skeleton class="card w-full"/>
    </div>
`,
	}),
};
