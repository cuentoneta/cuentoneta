import { Component, signal } from '@angular/core';
import { applicationConfig, argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { provideIcons } from '@ng-icons/core';
import { faBrandSpotify, faBrandYoutube } from '@ng-icons/font-awesome/brands';
import { ButtonGroupComponent, type ButtonGroupOption } from './button-group.component';

const formats: ButtonGroupOption[] = [
	{ id: 'audio', label: 'Audio' },
	{ id: 'video', label: 'Video' },
	{ id: 'podcast', label: 'Podcast' },
];

const meta: Meta<ButtonGroupComponent> = {
	title: 'Componentes V3/ButtonGroup',
	component: ButtonGroupComponent,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>ButtonGroupComponent</strong> del Design System v3 presenta una fila de opciones excluyentes: recibe las opciones ya resueltas y el id de la vigente, y emite el id de la que la persona usuaria elige.</p><p><strong>No decide ni guarda la elección.</strong> La emite y espera que el consumidor se la devuelva por <code>selectedId</code>, de modo que la fuente de verdad viva en un solo lugar. Identifica por id y no por el objeto entero, que es lo que le permite servir a dominios distintos sin conocer ninguno.</p><p>La apariencia de cada opción la pone <a href="./?path=/docs/componentes-v3-button--docs" target="_top"><strong>Button</strong></a>, en su variante <code>outline</code> y con el estado <code>active</code> para la vigente; el grupo solo aporta el layout de la fila. El anuncio a lectores de pantalla es <code>aria-pressed</code> en cada opción sobre un contenedor con <code>role="group"</code>, lo que conserva el contrato de teclado nativo del botón: <code>Tab</code> para llegar, <code>Enter</code> o <code>Espacio</code> para activar.</p><p>Los íconos los registra el consumidor con <code>provideIcons</code>: el grupo resuelve el nombre por el injector y no conoce el vocabulario de la pantalla que lo monta.</p><p><strong>Hoy no tiene consumidor en la aplicación</strong>: es una pieza de catálogo, construida junto con el eje <code>active</code> de Button para que las tres decisiones que resuelve —marcar una y desmarcar el resto, emitir sin decidir, y anunciar la elección— se tomen una sola vez.</p></div>`,
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
			description: 'Id de la opción vigente. Sin valor, ninguna lo está',
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

export const Playground: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-button-group ${argsToTemplate(args)} />`,
	}),
	args: {
		label: 'Formatos disponibles',
		options: formats,
		selectedId: 'audio',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>La API completa como controles vivos. Cambiar <code>selectedId</code> mueve la opción anunciada como vigente; el grupo no la mueve por su cuenta al hacer click, porque esa decisión es del consumidor.</p>`,
			},
		},
	},
};

export const ConIconos: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-button-group ${argsToTemplate(args)} />`,
	}),
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
				story: `<p>Cada opción puede llevar un ícono junto a su etiqueta. Los íconos se registran acá, en la story, y no en el preview del catálogo: registrarlos es responsabilidad del consumidor, porque son vocabulario de su pantalla. El ícono es decorativo —la etiqueta ya nombra la opción—, así que no altera el nombre accesible del botón.</p>`,
			},
		},
	},
};

export const SinSeleccion: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-button-group ${argsToTemplate(args)} />`,
	}),
	args: {
		label: 'Formatos disponibles',
		options: formats,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Sin <code>selectedId</code>, ninguna opción está vigente. Es un estado legítimo y no un error: el grupo no elige un valor por defecto, porque hacerlo sería decidir por el consumidor. Un <code>selectedId</code> que no coincide con ninguna opción se comporta igual.</p>`,
			},
		},
	},
};

// La story necesita un host con estado porque la aplicación corre zoneless: mutar un prop plano
// desde un handler no dispara detección de cambios y la elección no se repintaría.
@Component({
	selector: 'cuentoneta-button-group-story-host',
	imports: [ButtonGroupComponent],
	template: `
		<cuentoneta-button-group
			(optionSelected)="selectedId.set($event)"
			[options]="options"
			[selectedId]="selectedId()"
			label="Formatos disponibles"
		/>
	`,
})
class ButtonGroupStoryHostComponent {
	protected readonly options = formats;
	protected readonly selectedId = signal('audio');
}

export const Interactivo: Story = {
	render: () => ({
		template: `<cuentoneta-button-group-story-host />`,
	}),
	decorators: [moduleMetadata({ imports: [ButtonGroupStoryHostComponent] })],
	parameters: {
		docs: {
			description: {
				story: `<p>El contrato completo, con un contenedor que sí guarda la elección: el grupo emite el id, el contenedor lo aplica y se lo devuelve, y recién entonces se mueve la opción vigente. Es la única story donde hacer click cambia lo que se ve.</p>`,
			},
		},
	},
};
