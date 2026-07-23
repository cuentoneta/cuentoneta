import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { LiteraryWorkHeroHeaderComponent } from './literary-work-hero-header.component';
import { literaryWorkHeroFixtureMock } from './literary-work-hero-header.mock';

const meta: Meta<LiteraryWorkHeroHeaderComponent> = {
	component: LiteraryWorkHeroHeaderComponent,
	title: 'Componentes V3/LiteraryWorkHeroHeader',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Banda superior (hero) de la página de lectura de una obra. Usa la misma portada de la obra como fondo difuminado con una capa de opacidad y, en primer plano, presenta la portada nítida, los tags, la autoría (1..N autores, cada uno con enlace a su perfil), el título y la colección/año de publicación originales.</p><p>El fondo no es otra imagen: es la misma <code>coverImage</code> pedida al CDN en una talla mayor (1920px de ancho) para cubrir el ancho completo del hero.</p><p>Recibe la <code>LiteraryWork</code> completa como único input; cuando no se provee, renderiza su propio estado de carga (skeleton).</p><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada en primer plano), <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a> (tags de la obra, variante <code>gray</code>) e <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar de cada autor).</p></div>`,
			},
		},
		layout: 'fullscreen',
	},
	argTypes: {
		literaryWork: {
			control: { type: 'object' },
			description: 'Obra completa a partir de la cual se derivan portada, tags, autoría, título y publicación',
			table: { type: { summary: 'LiteraryWork' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<LiteraryWorkHeroHeaderComponent>;

export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { literaryWork: literaryWorkHeroFixtureMock },
	parameters: {
		docs: {
			description: {
				story:
					'Estado principal del hero con portada, tags, autoría (la fixture trae 2 autores), título y publicación.',
			},
		},
	},
};

// El hero renderiza su propio skeleton cuando no recibe obra, así que basta una única instancia.
export const Estados: StoryObj<LiteraryWorkHeroHeaderComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-hero-header [literaryWork]="loading ? undefined : literaryWork" />`,
	}),
	args: { loading: true, literaryWork: literaryWorkHeroFixtureMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};
