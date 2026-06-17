import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';

@Component({
	selector: 'cuentoneta-story-card-teaser-skeleton',
	imports: [SkeletonComponent],
	host: { class: 'w-full' },
	template: `<article class="flex gap-4">
		@if (order()) {
			<cuentoneta-skeleton data-testid="show-order" appearance="line" class="h-[36px] w-[40px] bg-brand-300" />
		}
		<div class="flex flex-1 flex-col">
			@if (showAuthor()) {
				<div class="flex items-center gap-2" data-testid="show-author">
					<cuentoneta-skeleton appearance="circle" class="w-5 bg-neutral-300" />
					<cuentoneta-skeleton appearance="line" class="h-5 w-full max-w-[160px] bg-neutral-300" />
				</div>
			}
			<div class="flex flex-col gap-1">
				<cuentoneta-skeleton appearance="line" class="h-8 w-full max-w-[192px] bg-neutral-300" />
				@if (showExcerpt()) {
					<div class="flex flex-col gap-1" data-testid="show-excerpt">
						@for (line of excerptArrayLines(); track $index) {
							<cuentoneta-skeleton
								[attr.data-testid]="'excerpt-skeleton-line-' + $index"
								[style.width.%]="$index === excerptLines() - 1 ? 80 : 100"
								appearance="line"
								class="h-4 w-full bg-neutral-300"
							/>
						}
					</div>
				}
				<footer class="flex gap-1 font-inter text-xs text-neutral-500">
					<cuentoneta-skeleton appearance="line" class="h-4 w-[120px] bg-neutral-300" />
					<span>•</span>
					<cuentoneta-skeleton appearance="line" class="h-4 w-[40px] bg-neutral-300" />
				</footer>
			</div>
		</div>
	</article>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserSkeletonComponent {
	// Inputs
	public readonly order = input<number>();
	public readonly showAuthor = input<boolean>(false);
	public readonly showExcerpt = input<boolean>(false);
	public readonly excerptLines = input<number>(3);

	// Usado de auxiliar para iterar a través de la cantidad de líneas del extracto de texto
	protected readonly excerptArrayLines = computed(() => Array(this.excerptLines()).fill(0));
}
