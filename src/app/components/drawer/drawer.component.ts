import { Component, computed, contentChild, effect, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

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
	imports: [NgTemplateOutlet],
	hostDirectives: [DrawerTransitionDirective, { directive: DrawerPanelDirective, inputs: ['direction'] }],
	host: { class: 'contents' },
	template: `
		<dialog
			[class]="panel.panelClasses()"
			[attr.data-open]="transition.isTransitionedIn() ? '' : null"
			[attr.aria-labelledby]="title() ? titleId : null"
			[attr.aria-describedby]="description() ? descriptionId : null"
			#dialog
			tabindex="-1"
			class="m-0 flex max-h-full flex-col gap-5 overflow-y-auto rounded-xl bg-white p-10 transition-transform duration-300 ease-out backdrop:bg-black/60 motion-reduce:duration-[0.01ms]"
		>
			<div class="flex items-start justify-between gap-4">
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
				<button
					(click)="close()"
					type="button"
					aria-label="Cerrar"
					class="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 p-2 text-neutral-900 hover:bg-neutral-200"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>

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

	protected readonly transition = inject(DrawerTransitionDirective);
	protected readonly panel = inject(DrawerPanelDirective);

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
		this.tracker.register(this);
		this.transition.open(dialog);
		this.opened.emit();
	}

	public close(): void {
		const dialog = this.dialogElement();
		if (!dialog.open) {
			return;
		}
		this.tracker.unregister(this);
		this.transition.close(dialog, () => this.afterClosed.emit());
		this.closed.emit();
	}
}
