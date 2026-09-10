import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';
import { ResourceComponent } from './resource.component';
import { authorMock } from '@mocks/author.mock';
import { resourceMock } from '@mocks/resource.mock';

const [wikipediaResource] = authorMock.resources;

// El corpus solo trae tipos que el mapa de íconos conoce, así que el caso se deriva con un slug que no
// existe en él — con uno mapeado, la story mostraría un ícono y no lo que dice mostrar.
const resourceWithUnknownType = {
	...resourceMock,
	resourceType: { ...resourceMock.resourceType, slug: 'un-tipo-que-el-frontend-no-conoce' },
};

const meta: Meta<ResourceComponent> = {
	title: 'Componentes V3/Resource',
	component: ResourceComponent,
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>ResourceComponent</strong> es el enlace circular a un recurso web externo: un ícono que abre el destino en otra pestaña, con el título del recurso como etiqueta accesible y como contenido de su tooltip.</p><p>El ícono <strong>no</strong> viaja desde el CMS: se resuelve del <code>slug</code> del tipo de recurso contra el mapa de íconos de la aplicación, de modo que un tipo sin ícono conocido dibuja el círculo vacío en lugar de romper.</p><p>Ofrece un eje de tamaño porque las dos superficies que lo montan reservan altos distintos: la columna de perfil de la página de autor usa 40 px y el resto del sitio los 48 del default.</p></div>`,
			},
		},
	},
	argTypes: {
		resource: {
			control: { type: 'object' },
			description: 'El recurso a enlazar: título, URL y tipo',
			table: { type: { summary: 'Resource' } },
		},
		size: {
			control: 'inline-radio',
			options: ['md', 'sm'],
			description: 'Diámetro del círculo: md = 48 px, sm = 40 px',
			table: { type: { summary: "'md' | 'sm'" }, defaultValue: { summary: "'md'" } },
		},
	},
};

export default meta;
type Story = StoryObj<ResourceComponent>;

export const Playground: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-resource ${argsToTemplate(args)} />`,
	}),
	args: { resource: wikipediaResource },
};

export const Tamanios: Story = {
	render: (args) => ({
		props: args,
		template: `<div class="flex items-center gap-4">
			<cuentoneta-resource [resource]="resource" size="md" />
			<cuentoneta-resource [resource]="resource" size="sm" />
		</div>`,
	}),
	args: { resource: wikipediaResource },
	parameters: {
		docs: {
			description: {
				story: `<p>Los dos tamaños uno al lado del otro, que es la única forma de comparar los 48 px contra los 40 sin montar las dos páginas que los usan.</p><p><strong>Usos:</strong> <code>md</code> en la ficha de obra; <code>sm</code> en la columna de perfil de la página de autor.</p>`,
			},
		},
	},
};

export const TipoSinIcono: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-resource ${argsToTemplate(args)} />`,
	}),
	args: { resource: resourceWithUnknownType },
	parameters: {
		docs: {
			description: {
				story: `<p>Un recurso cuyo tipo no tiene ícono en el mapa de la aplicación: el enlace se dibuja igual, vacío, en lugar de romper. Es lo que pasa cuando el CMS incorpora un tipo de recurso antes que el frontend su ícono.</p>`,
			},
		},
	},
};
