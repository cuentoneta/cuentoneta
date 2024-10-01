import { Meta, moduleMetadata } from '@storybook/angular';
import { PublicationCardComponent } from './publication-card.component';

import { DatePipe, NgOptimizedImage, registerLocaleData } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';

// Localización
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es-419';
registerLocaleData(localeEs);

// Modelos
import { Publication } from '@models/storylist.model';
import { storyPreviewMock } from '../../mocks/story.mock';
import { RouterTestingModule } from '@angular/router/testing';

export default {
	title: 'PublicationCardComponent',
	component: PublicationCardComponent,
	decorators: [
		moduleMetadata({
			imports: [
				NgOptimizedImage,
				NgxSkeletonLoaderModule,
				StoryCardSkeletonComponent,
				StoryEditionDateLabelComponent,
				RouterTestingModule,
			],
			providers: [DatePipe, { provide: LOCALE_ID, useValue: 'es-419' }],
		}),
	],
} as Meta<PublicationCardComponent>;

const publication: Publication = {
	publishingOrder: 60,
	published: true,
	publishingDate: '2022-03-01',
	story: storyPreviewMock,
};

export const Historia = {
	render: (args: PublicationCardComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-3 gap-4">
          <cuentoneta-publication-card
              [editionLabel]="editionPrefix" 
              [publication]="publication1"
              [navigationRoute]="['/']">
          </cuentoneta-publication-card>

    </div>
`,
	}),
	args: {
		editionPrefix: 'Episodio',
		editionSuffix: '',
		displayDate: false,
		editionIndex: 0,
		publication1: publication,
		publication2: { ...publication, published: false },
		publication3: null,
	},
};

export const Cargando = {
	render: (args: PublicationCardComponent) => ({
		props: args,
	}),
	args: {
		editionPrefix: 'Episodio',
		editionSuffix: '',
		displayDate: false,
		editionIndex: 0,
		publication: null,
	},
};
