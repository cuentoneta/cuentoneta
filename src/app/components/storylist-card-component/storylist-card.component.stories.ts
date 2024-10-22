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
				svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"></path></svg>',
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
				svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path fill="none" d="M0 0h24v24H0z"></path><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>',
			},
		},
		{
			title: 'Inglés',
			slug: 'ingles',
			description: 'Textos íntegramente en idioma inglés',
			icon: {
				name: 'people',
				provider: 'mdi',
				svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1em;"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path></svg>',
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
