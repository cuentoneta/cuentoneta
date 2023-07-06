import { Meta, moduleMetadata } from '@storybook/angular';
import { StoryCardComponent } from './story-card.component';
import { Publication } from '../../models/storylist.model';
import { Story } from '../../models/story.model';
import { NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';

export default {
  title: 'StoryCardComponent',
  component: StoryCardComponent,
  decorators: [
    moduleMetadata({
      imports: [
        NgOptimizedImage,
        NgxSkeletonLoaderModule,
        StoryCardSkeletonComponent,
        StoryEditionDateLabelComponent,
      ],
    }),
  ],
} as Meta<StoryCardComponent>;

const publication: Publication<Story> = {
  order: 60,
  published: true,
  publishingDate: '2022-03-01',
  story: {
    id: 1,
    approximateReadingTime: 4,
    author: {
      id: 1,
      fullBioUrl: '',
      nationality: {
        country: 'Argentina',
        flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ee6f30199738f983516909a0d6330301573a62f6-32x20.png',
      },
      imageUrl:
        'https://cdn.sanity.io/images/s4dbqkc5/production/c91d9010f27d5078ef787cb231395042b66db2cd-400x400.jpg',
      name: 'Alejandro Dolina',
    },
    slug: 'mascaras',
    title: 'Máscaras',
    summary:
      '"Máscaras" está incluido en el volumen "Bar del Infierno", publicado en 2005. La acción de la obra se sucede en un bar del cual no es posible salir, dado que en el universo del libro el afuera no existe. En este escenario, El Narrador de Historias, protagonista principal de esta narración enmarcada, procede a contar una variedad de relatos ubicados en distintos lugares y distintas épocas.',
    paragraphs: [
      'Según cuentan algunos, el corso de la avenida La Plata, en Santos Lugares, era utilizado frecuentemente por ángeles y demonios cuando tenían que cumplir alguna misión terrestre. Solía decirse también que entre todas las máscaras del corso, una era el diablo. Los hechiceros de Lourdes y Villa Lynch aprovechaban aquellas jornadas para suscribir convenios de toda clase con los poderes de las tinieblas. Tras las caretas espeluznantes se ocultaba el verdadero horror de las caras del mal.',
      'Los hombres sensibles de Flores solían pasearse por allí tratando de reconocer el sello de las legiones, o bien gritando frases ingeniosas en el oído de las muchachas. Cada vez que sospechaban el carácter sobrenatural de algún enmascarado, comenzaban a acosarlo tratando de provocar alguna reacción reveladora.',
    ],
    prologues: [],
  },
};

export const Historia = {
  render: (args: StoryCardComponent) => ({
    props: args,
    template: `
      <div class="grid grid-cols-3 gap-4">
          <cuentoneta-story-card
              [editionPrefix]="editionPrefix" 
              [editionSuffix]="editionSuffix" 
              [displayDate]="displayDate" 
              [editionIndex]="editionIndex" 
              [publication]="publication1">
          </cuentoneta-story-card>
          <cuentoneta-story-card
              [editionPrefix]="editionPrefix" 
              [editionSuffix]="editionSuffix" 
              [displayDate]="displayDate" 
              [editionIndex]="editionIndex" 
              [publication]="publication2">
          </cuentoneta-story-card>
          <cuentoneta-story-card
              [editionPrefix]="editionPrefix" 
              [editionSuffix]="editionSuffix" 
              [displayDate]="displayDate" 
              [editionIndex]="editionIndex" 
              [publication]="publication3">
          </cuentoneta-story-card>
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
  render: (args: StoryCardComponent) => ({
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
