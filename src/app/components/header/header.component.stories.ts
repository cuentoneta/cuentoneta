import { Meta } from '@storybook/angular';
import { HeaderComponent } from './header.component';

export default {
	title: 'HeaderComponent',
	component: HeaderComponent,
} as Meta<HeaderComponent>;

export const Primary = {
	render: (args: HeaderComponent) => ({
		props: args,
	}),
	args: {},
};
