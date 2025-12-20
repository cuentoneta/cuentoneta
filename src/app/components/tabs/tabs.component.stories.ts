import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import TabsComponent from './tabs.component';
import Tab from './tab.component';

const meta: Meta<TabsComponent> = {
	title: 'Componentes/Tabs',
	component: TabsComponent,
	decorators: [
		moduleMetadata({
			imports: [Tab],
		}),
	],
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		initialTab: {
			control: 'text',
			description: 'Nombre de la tab inicialmente activa',
		},
	},
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
	args: {
		initialTab: 'stories',
	},
	render: (args) => ({
		props: args,
		template: `
			<cuentoneta-tabs [initialTab]="initialTab">
				<cuentoneta-tab title="Historias" name="stories">
					<p>Content for Tab 1</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Ficha técnica" name="about">
					<p>Content for Tab 2</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Recursos multimedia" name="media">
					<p>Content for Tab 3</p>
				</cuentoneta-tab>
			</cuentoneta-tabs>
		`,
	}),
};

export const SecondTabActive: Story = {
	args: {
		initialTab: 'second',
	},
	render: (args) => ({
		props: args,
		template: `
			<cuentoneta-tabs [initialTab]="initialTab">
				<cuentoneta-tab title="First" name="first">
					<p>First tab content</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Second" name="second">
					<p>Second tab content (initially active)</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Third" name="third">
					<p>Third tab content</p>
				</cuentoneta-tab>
			</cuentoneta-tabs>
		`,
	}),
};

export const WithRichContent: Story = {
	args: {
		initialTab: 'settings',
	},
	render: (args) => ({
		props: args,
		template: `
			<cuentoneta-tabs [initialTab]="initialTab">
				<cuentoneta-tab title="Overview" name="overview">
					<h3>Overview</h3>
					<p>This is an overview section with rich content.</p>
					<ul>
						<li>Feature 1</li>
						<li>Feature 2</li>
						<li>Feature 3</li>
					</ul>
				</cuentoneta-tab>
				<cuentoneta-tab title="Details" name="details">
					<h3>Details</h3>
					<p>Detailed information goes here.</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Settings" name="settings">
					<h3>Settings</h3>
					<p>Configuration options would appear here.</p>
				</cuentoneta-tab>
			</cuentoneta-tabs>
		`,
	}),
};
