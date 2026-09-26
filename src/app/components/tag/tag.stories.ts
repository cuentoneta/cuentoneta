import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate, moduleMetadata } from '@storybook/angular-vite';

import { Tag } from './tag';
import { TagSkeleton } from './tag-skeleton';
import { authorTeaserCardDocs } from '@components/author-teaser-card/author-teaser-card.component.docs';
import { collectionTeaserCardDocs } from '@components/collection-teaser-card/collection-teaser-card.docs';
import { literaryWorkTeaserCardDocs } from '@components/literary-work-teaser-card/literary-work-teaser-card.docs';
import { literaryWorkTeaserHomeCardDocs } from '@components/literary-work-teaser-home-card/literary-work-teaser-home-card.docs';
import { docsMention, docsRef } from '@testing/storybook-docs';
import { tagDocs } from './tag.docs';

const meta: Meta<Tag> = {
	component: Tag,
	title: 'Componentes V3/Tag',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>La etiqueta (tag) del Design System v3, ${docsMention(tagDocs)}: muestra un texto breve con el estilo y la capitalización correspondientes a la variante elegida (input <code>variant</code>).</p><ul><li><strong>soft</strong> (default): solo texto en brand-500, sin fondo; sentence-case.</li><li><strong>filled</strong>: pill brand-50 con el texto en mayúsculas.</li><li><strong>gray</strong>: pill translúcido oscuro con texto claro, pensado para mostrarse sobre imágenes; sentence-case.</li></ul></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		label: { control: { type: 'text' } },
		variant: {
			control: { type: 'inline-radio' },
			options: ['soft', 'filled', 'gray'],
			table: { defaultValue: { summary: 'soft' } },
		},
	},
};

export default meta;
type Story = StoryObj<Tag>;

export const Soft: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'soft' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>soft</strong> (default): solo texto en brand-500, sin fondo. Comportamiento (Figma): la primera letra del texto en mayúscula y el resto en minúsculas (sentence-case).</p><p><strong>Usos:</strong> Home (en ${docsRef(collectionTeaserCardDocs)} y ${docsRef(literaryWorkTeaserHomeCardDocs)}); Story, Story List y Author Profile (en ${docsRef(literaryWorkTeaserCardDocs)}).</p>`,
			},
		},
	},
};

export const Filled: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'filled' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>filled</strong>: pill brand-50 con el texto en mayúsculas (aplicadas vía CSS). Comportamiento (Figma): todo el texto en mayúsculas.</p><p><strong>Usos:</strong> Home (en ${docsRef(authorTeaserCardDocs)}), Story List y Author Profile.</p>`,
			},
		},
	},
};

export const Gray: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'gray' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>gray</strong>: pill translúcido oscuro con texto claro, pensado para mostrarse sobre imágenes. Comportamiento (Figma): la primera letra del texto en mayúscula y el resto en minúsculas (sentence-case).</p><p><strong>Usos:</strong> Story.</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex items-center gap-3">
				<cuentoneta-tag [label]="label" variant="soft" />
				<cuentoneta-tag [label]="label" variant="filled" />
				<cuentoneta-tag [label]="label" variant="gray" />
			</div>
		`,
	}),
	args: { label: 'Crónica' },
	parameters: { docs: { description: { story: 'Las tres variantes: soft, filled y gray.' } } },
};

export const Skeleton: StoryObj = {
	decorators: [moduleMetadata({ imports: [TagSkeleton] })],
	render: () => ({ template: `<cuentoneta-tag-skeleton />` }),
	parameters: {
		docs: { description: { story: 'Skeleton de carga del tag.' } },
	},
};

export const Estados: StoryObj<Tag & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [TagSkeleton] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<cuentoneta-tag-skeleton />
			} @else {
				<cuentoneta-tag [label]="label" [variant]="variant" />
			}
		`,
	}),
	args: { loading: true, label: 'Crónica', variant: 'filled' },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};
