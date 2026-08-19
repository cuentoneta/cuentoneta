import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ButtonComponent, type ButtonSize } from '../button/button.component';

/**
 * Una opción del grupo, ya resuelta por el consumidor: el grupo no sabe de dónde salen.
 */
export interface ButtonGroupOption {
	/**
	 * Identidad de la opción. Es lo único que el grupo emite hacia arriba, y lo que compara contra
	 * `selectedId`, así que el consumidor debe entregarlo único dentro de la lista: dos opciones con
	 * el mismo id quedan vigentes a la vez.
	 */
	readonly id: string;
	/** Texto visible y nombre accesible de la opción. */
	readonly label: string;
	/** Nombre del ícono de ng-icons. Lo registra el consumidor con `provideIcons`. */
	readonly iconName?: string;
}

/**
 * Componente ButtonGroup
 *
 * Una fila de opciones excluyentes donde una sola está vigente. Recibe las opciones ya resueltas y
 * el id de la vigente, y emite el id de la que la persona usuaria elige: no decide ni guarda esa
 * elección, así que la fuente de verdad vive en un solo lugar, el consumidor.
 *
 * Identifica por id y no por el objeto entero para servir a dominios distintos sin conocer ninguno.
 * La apariencia de cada opción la pone `ButtonComponent`; acá solo se elige entre los valores que
 * ese componente ya declara.
 *
 * De los ejes del botón expone **solo la geometría** (`size`), porque cuánto espacio ocupa la fila
 * depende de dónde se la monta y eso lo sabe el consumidor. La apariencia queda fija: que las
 * opciones se vean iguales entre sí es parte de lo que hace legible un grupo excluyente.
 *
 * Los íconos los registra el consumidor con `provideIcons`: el grupo resuelve el nombre por el
 * injector y no conoce el vocabulario de la pantalla que lo monta.
 *
 * @example
 * ```html
 * <cuentoneta-button-group
 *   label="Formatos disponibles"
 *   [options]="formats()"
 *   [selectedId]="selectedFormatId()"
 *   (optionSelected)="selectedFormatId.set($event)"
 * />
 * ```
 */
@Component({
	selector: 'cuentoneta-button-group',
	imports: [ButtonComponent, NgIcon],
	host: {
		role: 'group',
		'[attr.aria-label]': 'label()',
		class: 'inline-flex flex-wrap items-center gap-2',
	},
	template: `
		@for (option of options(); track option.id) {
			@let isSelected = option.id === selectedId();
			<button
				(click)="optionSelected.emit(option.id)"
				[active]="isSelected"
				[attr.aria-pressed]="isSelected"
				[size]="size()"
				cuentoneta-button
				variant="outline"
				type="button"
			>
				@if (option.iconName) {
					<ng-icon [name]="option.iconName" data-testid="option-icon" size="24px" />
				}
				{{ option.label }}
			</button>
		}
	`,
})
export class ButtonGroupComponent {
	/** Nombre accesible del grupo, anunciado al entrar en él. */
	public readonly label = input.required<string>();

	/** Opciones ya resueltas. Solo se leen, por eso se aceptan de solo lectura. */
	public readonly options = input.required<readonly ButtonGroupOption[]>();

	/** Id de la opción vigente. Sin valor, ninguna lo está. */
	public readonly selectedId = input<string>();

	/** Geometría de las opciones. La apariencia sigue siendo del grupo, no del consumidor. */
	public readonly size = input<ButtonSize>('md');

	/** Id de la opción elegida por la persona usuaria. El grupo no la aplica: la emite. */
	public readonly optionSelected = output<string>();
}
