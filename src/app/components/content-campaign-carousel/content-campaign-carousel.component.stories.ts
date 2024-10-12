import { Meta, moduleMetadata } from '@storybook/angular';
import { ContentCampaignCarouselComponent } from './content-campaign-carousel.component';
import { ContentService } from '../../providers/content.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { contentCampaignMock } from '../../mocks/content-campaign.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { ContentCampaignCarouselSkeletonComponent } from './content-campaign-carousel-skeleton.component';

export default {
	title: 'ContentCampaignCarouselComponent',
	component: ContentCampaignCarouselComponent,
	decorators: [
		moduleMetadata({
			imports: [
				CommonModule,
				CarouselModule,
				NgOptimizedImage,
				RouterTestingModule,
				PortableTextParserComponent,
				NoopAnimationsModule,
				ContentCampaignCarouselSkeletonComponent,
			],
			providers: [ContentService],
		}),
	],
} as Meta<ContentCampaignCarouselComponent>;

export const Primary = {
	render: (args: ContentCampaignCarouselComponent) => ({
		props: args,
		template: `
	  <div class="block">
		<cuentoneta-content-campaign-carousel [slides]="slides"/>
		<cuentoneta-content-campaign-carousel-skeleton/>
		</div>
		`,
	}),
	args: {
		slides: contentCampaignMock,
	},
};
