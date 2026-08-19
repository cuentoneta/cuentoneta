import { argsToTemplate, moduleMetadata, Meta, StoryObj } from '@storybook/angular-vite';

import { MediaSelectorsComponent } from './media-selectors.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { MediaTeaser } from '@models/media.model';
import { onoffMediaMock, onoffYouTubeVideosMock, toMediaTeaser } from '@mocks/onoff-media.mock';

// Conjunto de medios variado: el canon completo más un video repetido, para que el modo agrupado
// muestre el contador con más medios que plataformas.
const media: MediaTeaser[] = [...onoffMediaMock, ...onoffYouTubeVideosMock].map(toMediaTeaser);

const meta: Meta<MediaSelectorsComponent> = {
	component: MediaSelectorsComponent,
	title: 'Componentes V3/MediaSelectors',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>MediaSelectorsComponent</strong> renderiza los selectores de los recursos multimedia (YouTube, X, Spotify, audio) asociados a una historia. Es un componente de presentación: no monta los widgets, solo emite cuál quedó elegido vía el output <code>selected</code>. Consume la vista de teaser del medio (<code>MediaTeaser</code>), que es el tag y nada más: alcanza para elegir el ícono de la plataforma, y no para montar un reproductor.</p><ul><li><code>selectable = false</code> (por defecto): agrupa por plataforma con un contador (badge). Decorativo.</li><li><code>selectable = true</code>: un selector clickeable por recurso; al click emite el <code>MediaTeaser</code> vía <code>selected</code>.</li></ul><p>Los inputs <code>theme</code> (<code>subtle</code> / <code>solid</code> / <code>bordered</code>) y <code>orientation</code> (<code>horizontal</code> / <code>vertical</code>) controlan la presentación.</p><p>Se consume desde <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a> y <a href="./?path=/docs/componentes-v3-literaryworkhomecardteaser--docs" target="_top"><strong>LiteraryWorkHomeCardTeaser</strong></a> (modo agrupado), y en la página de Story en modo seleccionable.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		media: {
			control: { type: 'object' },
			description: 'Recursos multimedia de la historia',
			table: { type: { summary: 'MediaTeaser[]' }, defaultValue: { summary: '[]' } },
		},
		theme: {
			control: { type: 'inline-radio' },
			options: ['subtle', 'solid', 'bordered'],
			description: 'Tema visual del recuadro y el contador',
			table: { defaultValue: { summary: 'subtle' } },
		},
		orientation: {
			control: { type: 'inline-radio' },
			options: ['horizontal', 'vertical'],
			description: 'Disposición de los selectores: en fila (horizontal) o en columna (vertical)',
			table: { defaultValue: { summary: 'horizontal' } },
		},
		selectable: {
			control: { type: 'boolean' },
			description: 'Si es true, un selector clickeable por recurso que emite `selected`; si es false, agrupa con badge',
			table: { defaultValue: { summary: 'false' } },
		},
		selected: { action: 'selected' },
	},
};

export default meta;
type Story = StoryObj<MediaSelectorsComponent>;

export const Grouped: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-media-selectors ${argsToTemplate(args)} />` }),
	args: { media, theme: 'subtle', orientation: 'horizontal', selectable: false },
	parameters: {
		docs: {
			description: {
				story: `<p>Modo agrupado (decorativo): un selector por plataforma con contador. Tema <code>subtle</code> (OnWhite).</p><p><strong>Usos:</strong> <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a> y <a href="./?path=/docs/componentes-v3-literaryworkhomecardteaser--docs" target="_top"><strong>LiteraryWorkHomeCardTeaser</strong></a>, como resumen de los recursos disponibles.</p>`,
			},
		},
	},
};

export const Selectable: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-media-selectors ${argsToTemplate(args)} />` }),
	args: { media, theme: 'solid', orientation: 'horizontal', selectable: true },
	parameters: {
		docs: {
			description: {
				story: `<p>Modo seleccionable: un botón por recurso. Al hacer click emite el <code>MediaTeaser</code> vía el output <code>selected</code> (ver la pestaña Actions).</p><p><strong>Usos:</strong> una vista que monte el widget del recurso elegido, resolviendo por su cuenta la vista completa del medio.</p>`,
			},
		},
	},
};

// Nota: se usan bindings explícitos (en lugar de argsToTemplate) porque theme/orientation difieren
// por instancia; argsToTemplate genera `[theme]="theme"` que apunta a un único `props.theme`.
export const Themes: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-6">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">subtle (sobre blanco)</h3>
					<cuentoneta-media-selectors [media]="media" [selectable]="selectable" theme="subtle" />
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">solid (sobre gris)</h3>
					<div class="rounded-lg bg-neutral-100 p-6">
						<cuentoneta-media-selectors [media]="media" [selectable]="selectable" theme="solid" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">bordered (tarjeta destacada)</h3>
					<div class="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
						<cuentoneta-media-selectors [media]="media" [selectable]="selectable" theme="bordered" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">orientation vertical</h3>
					<cuentoneta-media-selectors [media]="media" [selectable]="selectable" theme="solid" orientation="vertical" />
				</div>
			</div>
		`,
	}),
	args: { media, selectable: false },
	parameters: {
		docs: {
			description: {
				story: `<p>Vitrina de los tres temas en su contexto de fondo (subtle/solid/bordered) y la orientación vertical.</p><p><strong>Usos:</strong> referencia para elegir el tema según el fondo de la tarjeta contenedora.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<MediaSelectorsComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [SkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<div class="flex items-center gap-2.5">
					<cuentoneta-skeleton appearance="square" class="h-[34px] w-[38px] rounded-lg bg-neutral-300" />
					<cuentoneta-skeleton appearance="square" class="h-[34px] w-[38px] rounded-lg bg-neutral-300" />
					<cuentoneta-skeleton appearance="square" class="h-[34px] w-[38px] rounded-lg bg-neutral-300" />
				</div>
			} @else {
				<cuentoneta-media-selectors [media]="media" [theme]="theme" [selectable]="selectable" />
			}
		`,
	}),
	args: { loading: true, media, theme: 'subtle', selectable: false },
	parameters: {
		docs: {
			description: {
				story:
					'Este componente <strong>no tiene skeleton propio</strong>: el estado de carga lo gestiona el padre (ver <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a>). El placeholder de arriba replica el del skeleton del padre (barras 34×38) como referencia visual.',
			},
		},
	},
};
