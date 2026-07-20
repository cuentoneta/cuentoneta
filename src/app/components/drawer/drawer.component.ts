import {
	Component,
	computed,
	contentChild,
	effect,
	ElementRef,
	inject,
	input,
	output,
	signal,
	viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';

import { DrawerTrackerService } from './drawer-tracker.service';
import { DrawerTransitionDirective } from './drawer-transition.directive';
import { DrawerPanelDirective } from './drawer-panel.directive';
import { DrawerHeaderDirective } from './drawer-header.directive';
import { DrawerFooterDirective } from './drawer-footer.directive';

export type DrawerDirection = 'left' | 'right' | 'top' | 'bottom';

/**
 * Panel modal lateral del Design System v3. Se apoya en el elemento nativo `<dialog>` + `showModal()` (foco
 * atrapado, Escape y backdrop accesibles, sin dependencias) y compone tres piezas vía `hostDirectives`: la
 * transición (`DrawerTransitionDirective`), las clases por dirección (`DrawerPanelDirective`) y el registro
 * global de un único drawer activo (`DrawerTrackerService`).
 *
 * El contenido va por `<ng-content>`; opcionalmente admite encabezado/pie por `cuentonetaDrawerHeader`/
 * `cuentonetaDrawerFooter`, o un encabezado por defecto vía los inputs `title`/`description`. El estado de carga
 * NO es responsabilidad del drawer: el consumidor proyecta skeletons mientras carga (patrón del resto del repo).
 */
@Component({
	selector: 'cuentoneta-drawer',
	imports: [NgTemplateOutlet, NgIcon],
	providers: [provideIcons({ faSolidXmark })],
	hostDirectives: [DrawerTransitionDirective, { directive: DrawerPanelDirective, inputs: ['direction'] }],
	host: { class: 'contents' },
	template: `
		<dialog
			[class]="panel.panelClasses()"
			[attr.data-open]="transition.isTransitionedIn() ? '' : null"
			[attr.aria-labelledby]="title() ? titleId : null"
			[attr.aria-label]="dialogAriaLabel()"
			[attr.aria-describedby]="description() ? descriptionId : null"
			#dialog
			tabindex="-1"
			class="m-0 flex max-w-full flex-col gap-5 overflow-y-auto rounded-xl bg-white p-10 transition-transform duration-300 ease-out backdrop:bg-black/60 motion-reduce:duration-[0.01ms]"
		>
			<button
				(click)="close()"
				[class]="closeButtonClasses()"
				type="button"
				aria-label="Cerrar"
				class="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 p-2 text-neutral-900 hover:bg-neutral-200"
			>
				<ng-icon name="faSolidXmark" class="text-2xl" aria-hidden="true" />
			</button>

			@if (headerTemplate(); as header) {
				<ng-container [ngTemplateOutlet]="header.templateRef" />
			} @else if (title()) {
				<div>
					<h2 [id]="titleId" class="font-inter text-xl font-bold text-neutral-900">{{ title() }}</h2>
					@if (description()) {
						<p [id]="descriptionId" class="mt-1 font-inter text-sm text-neutral-600">{{ description() }}</p>
					}
				</div>
			}

			<div class="flex-1"><ng-content /></div>

			@if (footerTemplate(); as footer) {
				<ng-container [ngTemplateOutlet]="footer.templateRef" />
			}
		</dialog>
	`,
})
export class DrawerComponent {
	public readonly title = input('');
	public readonly description = input('');
	public readonly ariaLabel = input('');
	public readonly closeOnBackdrop = input(true);
	public readonly closeOnEscape = input(true);

	public readonly opened = output<void>();
	public readonly closed = output<void>();
	public readonly afterClosed = output<void>();

	private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
	private readonly dialogElement = computed(() => this.dialogRef().nativeElement);

	protected readonly headerTemplate = contentChild(DrawerHeaderDirective);
	protected readonly footerTemplate = contentChild(DrawerFooterDirective);

	private readonly tracker = inject(DrawerTrackerService);
	private readonly instanceId = this.tracker.nextId();
	protected readonly titleId = `drawer-title-${this.instanceId}`;
	protected readonly descriptionId = `drawer-desc-${this.instanceId}`;

	// Todo `<dialog>` modal necesita un nombre accesible: si hay `title` lo cubre `aria-labelledby`; en su ausencia
	// (slot de encabezado o contenido plano) se cae a `ariaLabel`, con un rótulo genérico por defecto.
	protected readonly dialogAriaLabel = computed(() => this.ariaLabel() || (this.title() ? null : 'Panel lateral'));

	protected readonly transition = inject(DrawerTransitionDirective);
	protected readonly panel = inject(DrawerPanelDirective);

	// El botón de cierre se ancla al borde interior del panel (el que da hacia el contenido, no hacia el borde del
	// viewport): a la derecha en `left`, a la izquierda en `right`, y centrado al fondo/al top en `top`/`bottom`.
	private readonly closeButtonConfig: Record<DrawerDirection, string> = {
		left: 'self-end',
		right: 'self-start',
		top: 'order-last self-center',
		bottom: 'self-center',
	};
	protected readonly closeButtonClasses = computed(() => this.closeButtonConfig[this.panel.direction()]);

	// Marca la ventana entre `close()` y `transitionend`, durante la cual el `<dialog>` sigue `open === true`: sin
	// esta guarda, un segundo `close()` en pleno cierre volvería a emitir eventos y a apilar listeners de transición.
	private readonly isClosing = signal(false);

	// Desregistra del tracker si el componente se destruye sin cerrar antes (p. ej. navegación con el drawer abierto):
	// de otro modo `activeInstance` quedaría apuntando a una instancia muerta y bloquearía todo `register()` futuro.
	private readonly unregisterOnDestroy = effect((onCleanup) => {
		onCleanup(() => this.tracker.unregister(this));
	});

	// Backdrop-click y Escape se cablean con addEventListener (no en la plantilla): la regla de ESLint
	// click-events-have-key-events solo analiza bindings de plantilla, y la paridad de teclado ya la dan el
	// Escape (evento `cancel`) y el botón de cierre real.
	private readonly wireDismissEffect = effect((onCleanup) => {
		const dialog = this.dialogElement();
		const onClick = (event: MouseEvent): void => {
			if (this.closeOnBackdrop() && event.target === dialog) {
				this.close();
			}
		};
		const onCancel = (event: Event): void => {
			event.preventDefault();
			if (this.closeOnEscape()) {
				this.close();
			}
		};
		dialog.addEventListener('click', onClick);
		dialog.addEventListener('cancel', onCancel);
		onCleanup(() => {
			dialog.removeEventListener('click', onClick);
			dialog.removeEventListener('cancel', onCancel);
		});
	});

	public open(): void {
		const dialog = this.dialogElement();
		if (dialog.open) {
			return;
		}
		this.isClosing.set(false);
		this.tracker.register(this);
		this.transition.open(dialog);
		this.opened.emit();
	}

	public close(): void {
		const dialog = this.dialogElement();
		if (!dialog.open || this.isClosing()) {
			return;
		}
		this.isClosing.set(true);
		this.tracker.unregister(this);
		this.transition.close(dialog, () => {
			this.isClosing.set(false);
			this.afterClosed.emit();
		});
		this.closed.emit();
	}
}
