import type { ElementRef } from '@angular/core';
import { Component, DOCUMENT, computed, effect, inject, input, signal, viewChild, viewChildren } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandFacebook, faBrandWhatsapp, faBrandXTwitter } from '@ng-icons/font-awesome/brands';
import { faSolidLink } from '@ng-icons/font-awesome/solid';

import { Button } from '../button/button';

/** Destino de red social: abre la intención de compartir en una ventana nueva. */
interface ShareDestination {
	readonly kind: 'share';
	readonly id: string;
	readonly label: string;
	readonly iconName: string;
	readonly windowTarget: string;
	readonly windowFeatures: string;
	/** Arma la URL de la intención a partir del enlace y del mensaje que acompañan al enlace. */
	readonly buildUrl: (url: string, message: string) => string;
}

/** Destino de portapapeles: no tiene endpoint ni ventana. */
interface CopyDestination {
	readonly kind: 'copy';
	readonly id: string;
	readonly label: string;
	readonly iconName: string;
}

type MenuDestination = ShareDestination | CopyDestination;

/** Confirmación del copiado: `idle` es la ausencia de confirmación. */
const CopyStatus = Object.freeze({ Idle: 'idle', Copied: 'copied', Failed: 'failed' } as const);
type CopyStatus = (typeof CopyStatus)[keyof typeof CopyStatus];

// `typescript.md` pide duration strings y aclara que el helper `parseDuration*` no existe todavía: la
// duración va en milisegundos con la humana al lado, como en `api/_helpers/cache-control.ts`.
const COPY_CONFIRMATION_DURATION = 3_000; // 3s

/**
 * Correlativo de instancias: el panel y su disparador se asocian por `id`, así que dos menús en el
 * mismo documento se pisarían si compartieran el suyo y el segundo disparador abriría el primero.
 */
let nextInstanceId = 0;

/**
 * Menú de compartir de una obra: despliega los destinos sobre el botón que lo monta —los de red y el
 * copiado del enlace— en un panel anclado a su borde derecho, que cierra al elegir un destino, al
 * presionar `Escape` y al hacer click afuera, y que al abrirse se lleva el foco a su primera opción.
 *
 * El enlace que comparte es el que recibe por `url`: cuál es el canónico lo decide quien lo monta.
 * `message` es el texto que acompaña a ese enlace en las redes que lo aceptan.
 */
@Component({
	selector: 'cuentoneta-share-menu',
	imports: [Button, NgIcon],
	providers: [provideIcons({ faBrandFacebook, faBrandWhatsapp, faBrandXTwitter, faSolidLink })],
	templateUrl: './share-menu.html',
	styleUrl: './share-menu.css',
	host: { class: 'contents' },
})
export class ShareMenu {
	public readonly url = input.required<string>();
	public readonly message = input.required<string>();

	private readonly document = inject(DOCUMENT);

	private readonly instanceId = ++nextInstanceId;
	private readonly triggerId = `share-menu-trigger-${this.instanceId}`;
	private readonly panelId = `share-menu-panel-${this.instanceId}`;

	private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
	private readonly options = viewChildren<ElementRef<HTMLButtonElement>>('option');

	private readonly isOpen = signal(false);
	private readonly activeIndex = signal(0);
	private readonly copyStatus = signal<CopyStatus>(CopyStatus.Idle);

	private readonly announcements: Record<CopyStatus, string> = {
		[CopyStatus.Idle]: '',
		[CopyStatus.Copied]: 'Enlace copiado al portapapeles',
		[CopyStatus.Failed]: 'No se pudo copiar el enlace',
	};

	private readonly destinations: readonly MenuDestination[] = [
		{
			kind: 'share',
			id: 'facebook',
			label: 'Facebook',
			iconName: 'faBrandFacebook',
			windowTarget: 'facebook-share-dialog',
			windowFeatures: 'width=626,height=436',
			buildUrl: (url) => `https://www.facebook.com/share.php?u=${encodeURIComponent(url)}`,
		},
		{
			kind: 'share',
			id: 'whatsapp',
			label: 'Whatsapp',
			iconName: 'faBrandWhatsapp',
			windowTarget: '_blank',
			windowFeatures: '',
			buildUrl: (url, message) => `whatsapp://send/?text=${encodeURIComponent(`${message}\n\n${url}`)}`,
		},
		{
			kind: 'share',
			id: 'x',
			label: 'X',
			iconName: 'faBrandXTwitter',
			windowTarget: '_blank',
			windowFeatures: '',
			buildUrl: (url, message) =>
				`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${message}\n\n`)}`,
		},
		{ kind: 'copy', id: 'copy', label: 'Copiar link', iconName: 'faSolidLink' },
	];

	private readonly triggerLabel = computed(() => (this.copyStatus() === CopyStatus.Copied ? 'Copiado' : 'Compartir'));

	private readonly copyAnnouncement = computed(() => this.announcements[this.copyStatus()]);

	// La confirmación del copiado es transitoria: se retira sola para que el botón vuelva a ofrecer
	// compartir, y el `onCleanup` corta el cierre pendiente si el menú se destruye antes.
	private readonly resetCopyStatusEffect = effect((onCleanup) => {
		if (this.copyStatus() === CopyStatus.Idle) {
			return;
		}
		const timeout = setTimeout(() => this.copyStatus.set(CopyStatus.Idle), COPY_CONFIRMATION_DURATION);
		onCleanup(() => clearTimeout(timeout));
	});

	private onToggle(event: ToggleEvent): void {
		const isOpen = event.newState === 'open';
		this.isOpen.set(isOpen);
		if (isOpen) {
			this.focusOption(0);
		}
	}

	// El foco que sale del menú lo cierra: ningún `menuitem` retiene el foco (WCAG 2.1.2) y el patrón
	// `menu` espera que `Tab` salga del menú en vez de dejarlo abierto detrás.
	private onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Tab') {
			this.panel().nativeElement.hidePopover();
			return;
		}
		const lastIndex = this.destinations.length - 1;
		const index = this.activeIndex();
		const movements: Record<string, number | undefined> = {
			ArrowDown: index === lastIndex ? 0 : index + 1,
			ArrowUp: index === 0 ? lastIndex : index - 1,
			Home: 0,
			End: lastIndex,
		};
		const nextIndex = movements[event.key];
		if (nextIndex === undefined) {
			return;
		}
		event.preventDefault();
		this.focusOption(nextIndex);
	}

	private activate(destination: MenuDestination): void {
		switch (destination.kind) {
			case 'share': {
				window.open(
					destination.buildUrl(this.shareUrl(), this.message()),
					destination.windowTarget,
					destination.windowFeatures,
				);
				break;
			}
			case 'copy': {
				void this.copyToClipboard();
				break;
			}
		}
		this.panel().nativeElement.hidePopover();
	}

	private focusOption(index: number): void {
		this.activeIndex.set(index);
		this.options()[index]?.nativeElement.focus();
	}

	// Absoluta aunque el canonical viaje relativo: el enlace se comparte fuera del sitio y las redes
	// necesitan el origen. En producción ya viene absoluta y esta resolución no la cambia.
	private shareUrl(): string {
		return new URL(this.url(), this.document.baseURI).href;
	}

	private async copyToClipboard(): Promise<void> {
		try {
			await navigator.clipboard.writeText(this.shareUrl());
			this.copyStatus.set(CopyStatus.Copied);
		} catch {
			this.copyStatus.set(CopyStatus.Failed);
		}
	}
}
