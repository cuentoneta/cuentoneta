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
		initialTabIndex: {
			control: 'number',
			description: 'Index of the initially active tab',
		},
	},
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
	args: {
		initialTabIndex: 0,
	},
	render: (args) => ({
		props: args,
		template: `
			<cuentoneta-tabs>
				<cuentoneta-tab title="Historias">
					<p>Content for Tab 1</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Ficha técnica">
					<p>Content for Tab 2</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Recursos multimedia">
					<p>Content for Tab 3</p>
				</cuentoneta-tab>
			</cuentoneta-tabs>
		`,
	}),
};

export const SecondTabActive: Story = {
	args: {
		initialTabIndex: 1,
	},
	render: (args) => ({
		props: args,
		template: `
			<cuentoneta-tabs [initialTabIndex]="initialTabIndex">
				<cuentoneta-tab title="First">
					<p>First tab content</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Second">
					<p>Second tab content (initially active)</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Third">
					<p>Third tab content</p>
				</cuentoneta-tab>
			</cuentoneta-tabs>
		`,
	}),
};

export const WithRichContent: Story = {
	args: {
		initialTabIndex: 0,
	},
	render: (args) => ({
		props: args,
		template: `
			<cuentoneta-tabs [initialTabIndex]="initialTabIndex">
				<cuentoneta-tab title="Overview">
					<h3>Overview</h3>
					<p>This is an overview section with rich content.</p>
					<ul>
						<li>Feature 1</li>
						<li>Feature 2</li>
						<li>Feature 3</li>
					</ul>
				</cuentoneta-tab>
				<cuentoneta-tab title="Details">
					<h3>Details</h3>
					<p>Detailed information goes here.</p>
				</cuentoneta-tab>
				<cuentoneta-tab title="Settings">
					<h3>Settings</h3>
					<p>Configuration options would appear here.</p>
				</cuentoneta-tab>
			</cuentoneta-tabs>
		`,
	}),
};
