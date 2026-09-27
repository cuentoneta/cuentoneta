import type { Meta } from '@storybook/angular-vite';
import { Footer } from './footer';

export default {
	title: 'Footer',
	component: Footer,
} as Meta<Footer>;

export const Primary = {
	render: (args: Footer) => ({
		props: args,
	}),
	args: {},
};
