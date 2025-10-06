import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { BioSummaryCardComponent } from './bio-summary-card.component';
import { storyMock } from '../../mocks/story.mock';
import { CommonModule, NgIf, NgOptimizedImage } from '@angular/common';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { ResourceComponent } from '../resource/resource.component';
import { provideRouter } from '@angular/router';

export default {
	title: 'BioSummaryCardComponent',
	component: BioSummaryCardComponent,
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage, NgIf, ResourceComponent, PortableTextParserComponent],
		}),
	],
} as Meta<BioSummaryCardComponent>;

export const Primary = {
	render: (args: BioSummaryCardComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-3 gap-4">
		<cuentoneta-bio-summary-card [story]="story"></cuentoneta-bio-summary-card>
		</div>
		`,
	}),
	args: {
		story: storyMock,
	},
};
