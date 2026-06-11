import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/** Tamaños del avatar (Design System v3): small=24px, medium=40px, large=120px. */
export type ImageProfileSize = 'small' | 'medium' | 'large';

/**
 * Variante del componente:
 * - `profile`: foto de perfil (o placeholder de persona si no hay imagen).
 * - `collection`: avatar de colección (fondo brand-100 + ícono de biblioteca).
 */
export type ImageProfileVariant = 'profile' | 'collection';

/**
 * Foto de perfil circular del Design System v3. Componente de presentación más anidado del árbol de
 * teasers: muestra la imagen de perfil de autores (y, a futuro, de usuarios logueados). Encapsula el
 * recorte circular, el placeholder y el redimensionado de la imagen según el tamaño de display.
 */
@Component({
	selector: 'cuentoneta-image-profile',
	imports: [NgOptimizedImage],
	template: `
		@if (variant() === 'collection') {
			<img
				[ngSrc]="'./assets/svg/collection.svg'"
				[width]="iconPx()"
				[height]="iconPx()"
				[class]="iconClass()"
				alt=""
				data-testid="collection-icon"
			/>
		} @else {
			@if (imageUrl(); as url) {
				<img
					[ngSrc]="url"
					[alt]="alt()"
					[width]="px()"
					[height]="px()"
					class="size-full object-cover"
					data-testid="image"
				/>
			} @else {
				<img
					[ngSrc]="'./assets/svg/profile-placeholder.svg'"
					[width]="iconPx()"
					[height]="iconPx()"
					[class]="iconClass()"
					alt=""
					data-testid="placeholder"
				/>
			}
		}
	`,
	host: {
		'[class]': 'containerClasses()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageProfileComponent {
	// Inputs
	readonly src = input<string>();
	readonly alt = input<string>('');
	readonly size = input<ImageProfileSize>('medium');
	readonly variant = input<ImageProfileVariant>('profile');

	// Tamaño del círculo (px) y clase de Tailwind (en unidades de spacing) y del ícono interno, por tamaño.
	private readonly sizeMap: Record<ImageProfileSize, { px: number; circle: string; icon: string }> = {
		small: { px: 24, circle: 'size-6', icon: 'size-3' },
		medium: { px: 40, circle: 'size-10', icon: 'size-5' },
		large: { px: 120, circle: 'size-30', icon: 'size-15' },
	};

	readonly px = computed(() => this.sizeMap[this.size()].px);
	readonly iconPx = computed(() => this.px() / 2);
	readonly iconClass = computed(() => this.sizeMap[this.size()].icon);

	// La imagen se solicita al CDN a 2x (HiDPI) del tamaño de display.
	readonly imageUrl = computed(() => {
		const src = this.src();
		return src ? `${src}?h=${this.px() * 2}&w=${this.px() * 2}` : '';
	});

	readonly containerClasses = computed(() => {
		const { circle } = this.sizeMap[this.size()];
		const background = this.variant() === 'collection' ? 'bg-brand-100' : 'bg-neutral-300';
		return `relative inline-flex items-center justify-center overflow-hidden rounded-full ${circle} ${background}`;
	});
}
