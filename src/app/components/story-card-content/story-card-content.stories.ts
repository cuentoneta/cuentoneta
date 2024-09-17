import { Meta, moduleMetadata } from '@storybook/angular';

import { CommonModule, NgOptimizedImage, registerLocaleData } from '@angular/common';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';

// Localización
import localeEs from '@angular/common/locales/es-419';
// Modelos
import { StoryCardContentComponent } from './story-card-content.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { storyPreviewMock } from '../../mocks/story.mock';

registerLocaleData(localeEs);

export default {
	title: 'StoryCardContentComponent',
	component: StoryCardContentComponent,
	decorators: [
		moduleMetadata({
			imports: [
				CommonModule,
				StoryEditionDateLabelComponent,
				PortableTextParserComponent,
				NgOptimizedImage,
				RouterLink,
				RouterTestingModule,
			],
		}),
	],
} as Meta<StoryCardContentComponent>;

export const Historia = {
	render: (args: StoryCardContentComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-3 gap-4">
          <cuentoneta-story-card-content
              [story]="story" 
              [headerText]="story.originalPublication"
              [navigationLink]="'/'">
          </cuentoneta-story-card-content>
    </div>
`,
	}),
	args: {
		story: storyPreviewMock,
	},
};
