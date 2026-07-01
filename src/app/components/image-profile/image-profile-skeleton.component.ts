import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import type { ImageProfileSize } from './image-profile.component';

// Dimensión y color del skeleton, para que su bounding box coincida 1:1 con el avatar real (sin jitter).
const SIZE_CLASSES: Record<ImageProfileSize, string> = {
	small: 'size-6',
	medium: 'size-10',
	lg: 'size-20',
	xl: 'size-30',
};
const SKELETON_COLOR = 'bg-neutral-300';

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

	protected readonly skeletonClasses = computed(() => `${SIZE_CLASSES[this.size()]} ${SKELETON_COLOR}`);
}
