import { Component, input, linkedSignal } from '@angular/core';
import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { provideIcons } from '@ng-icons/core';
import { faBrandSpotify, faBrandYoutube } from '@ng-icons/font-awesome/brands';
import { ButtonGroupComponent, type ButtonGroupOption } from './button-group.component';

const formats: ButtonGroupOption[] = [
	{ id: 'audio', label: 'Audio' },
	{ id: 'video', label: 'Video' },
	{ id: 'podcast', label: 'Podcast' },
];

// El contenedor que el catálogo cablea por cada story. Existe porque el grupo no guarda la
// elección: sin alguien que se la devuelva, hacer click no movería nada y el catálogo mostraría
// una fila inerte. La elección se rehace cuando cambian los controles, para que editar `options`
// o `selectedId` no deje vigente un id que ya no está en la lista.
@Component({
	selector: 'cuentoneta-button-group-story-host',
	imports: [ButtonGroupComponent],
	template: `
		<cuentoneta-button-group
			(optionSelected)="selectedId.set($event)"
			[label]="label()"
			[options]="options()"
			[selectedId]="selectedId()"
		/>
	`,
})
class ButtonGroupStoryHostComponent {
	public readonly label = input.required<string>();
	public readonly options = input.required<readonly ButtonGroupOption[]>();
	public readonly initialSelectedId = input<string>();

	protected readonly selectedId = linkedSignal(() => this.initialSelectedId());
}

const meta: Meta<ButtonGroupComponent> = {
	title: 'Componentes V3/ButtonGroup',
	component: ButtonGroupComponent,
	decorators: [moduleMetadata({ imports: [ButtonGroupStoryHostComponent] })],
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>ButtonGroupComponent</strong> del Design System v3 presenta una fila de opciones excluyentes: recibe las opciones ya resueltas y el id de la vigente, y emite el id de la que la persona usuaria elige.</p><p><strong>No decide ni guarda la elección.</strong> La emite y espera que el consumidor se la devuelva por <code>selectedId</code>, de modo que la fuente de verdad viva en un solo lugar. Identifica por id y no por el objeto entero, que es lo que le permite servir a dominios distintos sin conocer ninguno.</p><p>Todas las entradas de este catálogo montan el grupo dentro de un contenedor que guarda la elección y se la devuelve, que es como se lo usa en una pantalla real: por eso hacer click mueve la opción vigente. El componente por sí solo no la movería, y eso lo fija su spec.</p><p>La apariencia de cada opción la pone <a href="./?path=/docs/componentes-v3-button--docs" target="_top"><strong>Button</strong></a>, en su variante <code>outline</code> y con el estado <code>active</code> para la vigente; el grupo solo aporta el layout de la fila. El anuncio a lectores de pantalla es <code>aria-pressed</code> en cada opción sobre un contenedor con <code>role="group"</code>, lo que conserva el contrato de teclado nativo del botón: <code>Tab</code> para llegar, <code>Enter</code> o <code>Espacio</code> para activar.</p><p>Los íconos los registra el consumidor con <code>provideIcons</code>: el grupo resuelve el nombre por el injector y no conoce el vocabulario de la pantalla que lo monta.</p><p><strong>Hoy no tiene consumidor en la aplicación</strong>: es una pieza de catálogo, construida junto con el eje <code>active</code> de Button para que las tres decisiones que resuelve —marcar una y desmarcar el resto, emitir sin decidir, y anunciar la elección— se tomen una sola vez.</p></div>`,
			},
		},
	},
	argTypes: {
		label: {
			control: 'text',
			description: 'Nombre accesible del grupo, anunciado al entrar en él',
			table: { type: { summary: 'string' } },
		},
		options: {
			control: { type: 'object' },
			description: 'Opciones ya resueltas por el consumidor: id, etiqueta y, opcionalmente, nombre de ícono',
			table: { type: { summary: 'readonly ButtonGroupOption[]' } },
		},
		selectedId: {
			control: 'text',
			description: 'Id de la opción vigente al montar. Desde ahí la mueve el contenedor de la story',
			table: { type: { summary: 'string | undefined' }, defaultValue: { summary: 'undefined' } },
		},
		optionSelected: {
			action: 'optionSelected',
			description: 'Emite el id de la opción elegida. El grupo no la aplica',
			table: { type: { summary: 'string' } },
		},
	},
};

export default meta;
type Story = StoryObj<ButtonGroupComponent>;

const renderInHost: Story['render'] = (args) => ({
	props: args,
	template: `<cuentoneta-button-group-story-host [label]="label" [options]="options" [initialSelectedId]="selectedId" />`,
});

export const Playground: Story = {
	render: renderInHost,
	args: {
		label: 'Formatos disponibles',
		options: formats,
		selectedId: 'audio',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>La API completa como controles vivos, con la elección ya cableada: hacer click mueve la opción vigente y editar <code>selectedId</code> la reposiciona.</p><p><strong>Usos:</strong> punto de entrada para probar la API antes de montar el grupo en una pantalla.</p>`,
			},
		},
	},
};

export const ConIconos: Story = {
	render: renderInHost,
	args: {
		label: 'Formatos disponibles',
		options: [
			{ id: 'video', label: 'Video', iconName: 'faBrandYoutube' },
			{ id: 'podcast', label: 'Podcast', iconName: 'faBrandSpotify' },
		],
		selectedId: 'video',
	},
	decorators: [
		applicationConfig({
			providers: [provideIcons({ faBrandYoutube, faBrandSpotify })],
		}),
	],
	parameters: {
		docs: {
			description: {
				story: `<p>Cada opción puede llevar un ícono junto a su etiqueta. Los íconos se registran acá, en la story, y no en el preview del catálogo: registrarlos es responsabilidad del consumidor, porque son vocabulario de su pantalla. El ícono es decorativo —la etiqueta ya nombra la opción—, así que no altera el nombre accesible del botón.</p><p><strong>Usos:</strong> grupos donde el ícono identifica la opción de un vistazo, como una elección de formato o de plataforma.</p>`,
			},
		},
	},
};

export const SinSeleccion: Story = {
	render: renderInHost,
	args: {
		label: 'Formatos disponibles',
		options: formats,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Sin <code>selectedId</code>, ninguna opción está vigente al montar. Es un estado legítimo y no un error: el grupo no elige un valor por defecto, porque hacerlo sería decidir por el consumidor. Un <code>selectedId</code> que no coincide con ninguna opción se comporta igual.</p><p>Hacer click elige la primera, y desde ahí ya no vuelve a haber ninguna vigente: el estado vacío es el inicial, no uno al que se regrese.</p><p><strong>Usos:</strong> el estado inicial de una pantalla que todavía no tiene una opción elegida.</p>`,
			},
		},
	},
};

export const OpcionUnica: Story = {
	render: renderInHost,
	args: {
		label: 'Formatos disponibles',
		options: [{ id: 'audio', label: 'Audio' }],
		selectedId: 'audio',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Con una sola opción no hay elección que ofrecer, pero el grupo la renderiza igual y la anuncia como vigente: decidir que una fila de uno no se muestra es del consumidor, que es quien sabe si en ese caso corresponde otra cosa.</p><p><strong>Usos:</strong> el caso borde que conviene mirar antes de montar el grupo sobre una colección de tamaño variable.</p>`,
			},
		},
	},
};
