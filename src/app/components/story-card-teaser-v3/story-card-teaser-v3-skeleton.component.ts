import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { SkeletonComponent } from '@components/skeleton/skeleton.component';
import { StoryCardTeaserV3Variant } from './story-card-teaser-v3.component';

/**
 * Estado de carga (esqueleto) de StoryCardTeaserV3Component. Replica la estructura de la tarjeta
 * con placeholders de cuentoneta-skeleton para evitar saltos de layout mientras la story carga.
 *
 * Recibe los mismos flags de presentación que la tarjeta (variante, orden, autor, descripción,
 * multimedia y líneas del extracto) para que el esqueleto coincida con lo que se va a renderizar.
 */
@Component({
	selector: 'cuentoneta-story-card-teaser-v3-skeleton',
	imports: [SkeletonComponent, NgTemplateOutlet],
	host: { class: 'block' },
	template: `
		<article [class]="rowWrapperClasses()">
			<cuentoneta-skeleton
				[class.order-last]="variant() === 'highlighted'"
				appearance="square"
				class="h-[164px] w-[118px] shrink-0 rounded-lg bg-neutral-300"
			/>
			<div [class]="rowColumnClasses()">
				@if (showAuthor()) {
					<ng-container [ngTemplateOutlet]="author" />
				}
				<div class="flex w-full flex-col gap-2">
					<cuentoneta-skeleton appearance="line" class="h-6 w-full max-w-64 bg-neutral-300" />
					@if (showExcerpt()) {
						<div class="flex flex-col gap-1">
							@for (line of descriptionLines(); track $index) {
								<cuentoneta-skeleton
									[class]="$last ? 'h-4 w-3/4 bg-neutral-300' : 'h-4 w-full bg-neutral-300'"
									appearance="line"
								/>
							}
						</div>
					}
					<cuentoneta-skeleton appearance="line" class="h-4 w-full max-w-44 bg-neutral-300" />
				</div>
				@if (showMultimedia()) {
					<div class="flex items-center gap-2.5">
						@for (selector of mediaPlaceholders; track $index) {
							<cuentoneta-skeleton appearance="square" class="h-[34px] w-[38px] rounded-lg bg-neutral-300" />
						}
					</div>
				}
			</div>
		</article>

		<!-- Autor: avatar circular + línea con el nombre -->
		<ng-template #author>
			<div class="flex items-center gap-2">
				<cuentoneta-skeleton appearance="circle" class="h-6 w-6 bg-neutral-300" />
				<cuentoneta-skeleton appearance="line" class="h-4 w-full max-w-40 bg-neutral-300" />
			</div>
		</ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserV3SkeletonComponent {
	// Inputs (espejo de StoryCardTeaserV3Component)
	public readonly variant = input<StoryCardTeaserV3Variant>('on-white');
	public readonly order = input<number>();
	public readonly showAuthor = input<boolean>(false);
	public readonly showExcerpt = input<boolean>(false);
	public readonly showMultimedia = input<boolean>(false);
	public readonly excerptLines = input<number>(2);

	// Placeholders de los selectores de multimedia (YouTube, X, Spotify).
	protected readonly mediaPlaceholders = [0, 1, 2];

	protected readonly descriptionLines = computed(() => Array(this.excerptLines()).fill(0));

	protected readonly rowWrapperClasses = computed(() =>
		this.variant() === 'highlighted'
			? 'flex w-full max-w-178.75 items-start gap-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-6'
			: 'flex w-full max-w-178.75 items-start gap-6',
	);

	protected readonly rowColumnClasses = computed(() => {
		const base = 'flex min-w-0 flex-1 flex-col justify-center gap-3';
		return this.variant() === 'highlighted' ? base : `${base} pt-1`;
	});
}
