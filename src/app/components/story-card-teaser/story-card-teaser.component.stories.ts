import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { StoryCardTeaserComponent } from './story-card-teaser.component';
import { storyTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import { CommonModule } from '@angular/common';
import { StoryTeaserWithAuthor } from '@models/story.model';
import { provideRouter } from '@angular/router';

const meta: Meta<StoryCardTeaserComponent> = {
	component: StoryCardTeaserComponent,
	title: 'Componentes/StoryCardTeaser',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [CommonModule],
		}),
	],
	parameters: {
		docs: {
			description: {
				component: `
					**StoryCardTeaserComponent** muestra una vista previa de historia con elementos opcionales:
					- Contenido de historia o estado de carga esqueleto
					- Información opcional del autor
					- Numeración/orden opcional
					- Extracto opcional con líneas configurables
					- Parámetros de navegación para enrutamiento

					Usa los controles interactivos en la primera historia de abajo para ver cómo se comporta el componente en ambos estados: cargado y esqueleto.
				`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		story: {
			control: { type: 'object' },
			description: 'Objeto de datos de la historia con título, autor, contenido, etc.',
			table: {
				type: { summary: 'StoryNavigationTeaserWithAuthor | StoryTeaserWithAuthor' },
				defaultValue: { summary: 'undefined' },
			},
		},
		order: {
			control: { type: 'number', min: 1, max: 99 },
			description: 'Numeración opcional para la historia (se muestra como orden formateado)',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: 'undefined' },
			},
		},
		showAuthor: {
			control: { type: 'boolean' },
			description: 'Mostrar información del autor con avatar y nombre',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		showExcerpt: {
			control: { type: 'boolean' },
			description: 'Mostrar extracto/texto de vista previa de la historia',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		excerptLines: {
			control: { type: 'range', min: 1, max: 6, step: 1 },
			description: 'Número de líneas a mostrar para el extracto (cuando showExcerpt es verdadero)',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '3' },
			},
		},
		navigationParams: {
			control: { type: 'object' },
			description: 'Parámetros de navegación para contexto de enrutamiento',
			table: {
				type: { summary: '{ navigation: string; navigationSlug: string }' },
				defaultValue: { summary: 'undefined' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<StoryCardTeaserComponent>;

// Historia de documentación/Playground interactivo
export const Docs: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Estado Cargado</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate(args)} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Estado Esqueleto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, story: undefined })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		showAuthor: false,
		showExcerpt: false,
		excerptLines: 3,
		order: undefined,
		navigationParams: undefined,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Playground interactivo que muestra ambos estados: cargado y esqueleto. Usa los controles de abajo para ver cómo diferentes configuraciones afectan ambos estados.',
			},
		},
	},
};

// Historia por defecto con configuración básica
export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Cargado</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate(args)} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Esqueleto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, story: undefined })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		showAuthor: false,
		showExcerpt: false,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: 'Tarjeta de historia básica con título y tiempo de lectura, mostrada junto a su estado esqueleto.',
			},
		},
	},
};

// Con información del autor
export const WithAuthor: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Cargado</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate(args)} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Esqueleto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, story: undefined })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		showAuthor: true,
		showExcerpt: false,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: 'Tarjeta de historia mostrando avatar y nombre del autor, junto a su estado esqueleto.',
			},
		},
	},
};

// Con número de orden
export const WithOrder: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Cargado</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate(args)} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Esqueleto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, story: undefined })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		order: 3,
		showAuthor: false,
		showExcerpt: false,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: 'Tarjeta de historia con numeración/orden, mostrada junto a su estado esqueleto.',
			},
		},
	},
};

// Con extracto
export const WithExcerpt: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Cargado</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate(args)} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Esqueleto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, story: undefined })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		showAuthor: false,
		showExcerpt: true,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: 'Tarjeta de historia con vista previa de extracto de texto, mostrada junto a su estado esqueleto.',
			},
		},
	},
};

// Variante con todas las características
export const FullFeatured: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Cargado</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate(args)} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Esqueleto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, story: undefined })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		order: 5,
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 4,
		navigationParams: {
			navigation: 'author',
			navigationSlug: 'sample-author',
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Tarjeta de historia con todas las características habilitadas: orden, autor, extracto y navegación, mostrada junto a su estado esqueleto.',
			},
		},
	},
};

// Diferentes cantidades de líneas de extracto
export const ExcerptVariations: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="space-y-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Extracto de 1 Línea</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, excerptLines: 1 })} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Extracto de 3 Líneas</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, excerptLines: 3 })} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Extracto de 5 Líneas</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ ...args, excerptLines: 5 })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: 'Comparación de diferentes cantidades de líneas de extracto.',
			},
		},
	},
};

// Vitrina de todas las variantes
export const AllVariants: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Básico</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ story: args.story })} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Cargando</h3>
					<cuentoneta-story-card-teaser />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Con Orden</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ story: args.story, order: 3 })} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Con Autor</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ story: args.story, showAuthor: true })} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Con Extracto</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ story: args.story, showExcerpt: true, excerptLines: 3 })} />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold text-sm text-gray-600">Completo</h3>
					<cuentoneta-story-card-teaser ${argsToTemplate({ story: args.story, order: 7, showAuthor: true, showExcerpt: true, excerptLines: 4 })} />
				</div>
			</div>
		`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock } as StoryTeaserWithAuthor,
	},
	parameters: {
		docs: {
			description: {
				story: 'Vista general de todas las variantes y estados del componente.',
			},
		},
	},
};
