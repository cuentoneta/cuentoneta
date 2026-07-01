import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import type { ImageProfileSize } from './image-profile.component';

// Clases de dimensión por tamaño; replican el `sizeMap` de ImageProfileComponent para que el bounding
// box del skeleton coincida 1:1 con el del avatar real.
const SIZE_CLASSES: Record<ImageProfileSize, string> = {
	small: 'size-6',
	medium: 'size-10',
	lg: 'size-20',
	xl: 'size-30',
};

/**
 * Skeleton de carga de `ImageProfileComponent`: un círculo del mismo tamaño que el avatar real, para
 * alternar real↔skeleton sin jitter. El host `inline-flex` encoge al tamaño del skeleton interno.
 */
@Component({
	selector: 'cuentoneta-image-profile-skeleton',
	imports: [SkeletonComponent],
	template: `<cuentoneta-skeleton [class]="skeletonClasses()" appearance="circle" />`,
	host: {
		class: 'inline-flex',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageProfileSkeletonComponent {
	public readonly size = input<ImageProfileSize>('medium');

	protected readonly skeletonClasses = computed(() => `${SIZE_CLASSES[this.size()]} bg-neutral-300`);
}
