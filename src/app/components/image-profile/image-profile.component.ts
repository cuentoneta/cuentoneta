import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { withSanityImageParams } from '@utils/sanity-image.utils';

/** Tamaños del avatar (Design System v3): small=24px, medium=40px, lg=80px, xl=120px. */
export type ImageProfileSize = 'small' | 'medium' | 'lg' | 'xl';

/**
 * Variante pública del componente (elección del consumidor):
 * - `profile`: foto de perfil (cae en placeholder de persona si no se pasa `src`).
 * - `collection`: avatar de colección (fondo brand-100 + ícono de biblioteca).
 */
export type ImageProfileVariant = 'profile' | 'collection';

/**
 * Estado de render efectivo (derivado de `variant` + `src`), no es parte de la API pública:
 * - `photo`: imagen real solicitada al CDN.
 * - `placeholder`: ícono de persona (variante `profile` sin `src`).
 * - `collection`: ícono de biblioteca.
 */
type RenderMode = 'photo' | 'placeholder' | 'collection';

const COLLECTION_ICON = './assets/svg/collection.svg';
const PROFILE_PLACEHOLDER = './assets/svg/profile-placeholder.svg';

/**
 * Foto de perfil circular del Design System v3. Componente de presentación más anidado del árbol de
 * teasers: muestra la imagen de perfil de autores (y, a futuro, de usuarios logueados). Encapsula el
 * recorte circular, el placeholder y el redimensionado de la imagen según el tamaño de display.
 */
@Component({
	selector: 'cuentoneta-image-profile',
	imports: [NgOptimizedImage],
	template: `
		<img [ngSrc]="view().url" [width]="view().px" [height]="view().px" [class]="view().classes" [alt]="alt()" />
	`,
	host: {
		'[class]': 'containerClasses()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageProfileComponent {
	// Inputs
	public readonly src = input<string>();
	public readonly alt = input<string>('');
	public readonly size = input<ImageProfileSize>('medium');
	public readonly variant = input<ImageProfileVariant>('profile');

	// Tamaño del círculo (px) y clases de Tailwind del círculo y del ícono interno, por tamaño.
	private readonly sizeMap: Record<ImageProfileSize, { px: number; circle: string; icon: string }> = {
		small: { px: 24, circle: 'size-6', icon: 'size-3' },
		medium: { px: 40, circle: 'size-10', icon: 'size-5' },
		lg: { px: 80, circle: 'size-20', icon: 'size-10' },
		xl: { px: 120, circle: 'size-30', icon: 'size-15' },
	};

	// Estado de render efectivo: única fuente de verdad de "qué se dibuja", derivada de variant + src.
	private readonly renderMode = computed<RenderMode>(() => {
		if (this.variant() === 'collection') {
			return 'collection';
		}
		return this.src() ? 'photo' : 'placeholder';
	});

	// Descriptor único por estado: centraliza url, tamaño, clases de la imagen y fondo del círculo.
	protected readonly view = computed(() => {
		const { px, icon } = this.sizeMap[this.size()];
		switch (this.renderMode()) {
			case 'collection':
				return { url: COLLECTION_ICON, px: px / 2, classes: icon, background: 'bg-brand-100' };
			case 'placeholder':
				return { url: PROFILE_PLACEHOLDER, px: px / 2, classes: icon, background: 'bg-neutral-300' };
			default:
				// photo: la imagen se solicita al CDN a 2x (HiDPI) del tamaño de display.
				return {
					url: withSanityImageParams(this.src(), { h: px * 2, w: px * 2 }),
					px,
					classes: 'size-full object-cover',
					background: 'bg-neutral-300',
				};
		}
	});

	protected readonly containerClasses = computed(() => {
		const { circle } = this.sizeMap[this.size()];
		return `relative inline-flex items-center justify-center overflow-hidden rounded-full ${circle} ${this.view().background}`;
	});
}
