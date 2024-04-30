import { Meta, moduleMetadata } from '@storybook/angular';
import { HeaderComponent } from './header.component';
import { ContentService } from '../../providers/content.service';
import { HttpClientModule } from '@angular/common/http';

export default {
	title: 'HeaderComponent',
	component: HeaderComponent,
	decorators: [
		moduleMetadata({
			imports: [HttpClientModule],
			providers: [ContentService],
		}),
	],
} as Meta<HeaderComponent>;

export const Primary = {
	render: (args: HeaderComponent) => ({
		props: args,
	}),
	args: {},
};
