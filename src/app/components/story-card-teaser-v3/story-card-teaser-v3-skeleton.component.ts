import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { StoryCardTeaserV3Variant } from './story-card-teaser-v3.component';

/**
 * Estado de carga (esqueleto) de StoryCardTeaserV3Component. Replica la estructura de cada variante
 * con placeholders de ngx-skeleton-loader para evitar saltos de layout mientras la story carga.
 *
 * Recibe los mismos flags de presentación que la tarjeta (variante, orden, autor, descripción,
 * multimedia y líneas del extracto) para que el esqueleto coincida con lo que se va a renderizar.
 */
@Component({
	selector: 'cuentoneta-story-card-teaser-v3-skeleton',
	imports: [NgxSkeletonLoaderModule, NgTemplateOutlet],
	template: `
		@switch (variant()) {
			@case ('compact') {
				<article class="flex w-full max-w-98.75 flex-col items-center gap-4">
					<div class="flex w-full items-center justify-center rounded-xl bg-neutral-100 py-5">
						<ngx-skeleton-loader [theme]="coverTheme" appearance="line" count="1" class="cover-skeleton" />
					</div>
					<div class="flex w-full flex-col gap-1">
						@if (showAuthor()) {
							<ng-container [ngTemplateOutlet]="author" />
						}
						<ngx-skeleton-loader
							[theme]="titleTheme"
							appearance="line"
							count="1"
							class="title-skeleton w-full max-w-48"
						/>
						<ngx-skeleton-loader [theme]="lineTheme" appearance="line" count="1" class="w-full max-w-36" />
					</div>
				</article>
			}
			@default {
				<article [class]="rowWrapperClasses()">
					<ngx-skeleton-loader
						[theme]="coverTheme"
						[class.order-last]="variant() === 'highlighted'"
						appearance="line"
						count="1"
						class="cover-skeleton shrink-0"
					/>
					<div [class]="rowColumnClasses()">
						@if (showAuthor()) {
							<ng-container [ngTemplateOutlet]="author" />
						}
						<div class="flex w-full flex-col gap-2">
							<ngx-skeleton-loader
								[theme]="titleTheme"
								appearance="line"
								count="1"
								class="title-skeleton w-full max-w-64"
							/>
							@if (showDescription()) {
								<div class="flex flex-col gap-1">
									@for (line of descriptionLines(); track $index) {
										<ngx-skeleton-loader
											[theme]="lineTheme"
											[class]="$last ? 'w-3/4' : 'w-full'"
											appearance="line"
											count="1"
										/>
									}
								</div>
							}
							<ngx-skeleton-loader [theme]="lineTheme" appearance="line" count="1" class="w-full max-w-44" />
						</div>
						@if (showMultimedia()) {
							<div class="flex items-center gap-2.5">
								@for (selector of mediaPlaceholders; track $index) {
									<ngx-skeleton-loader [theme]="mediaTheme" appearance="line" count="1" />
								}
							</div>
						}
					</div>
				</article>
			}
		}

		<!-- Autor: avatar circular + línea con el nombre -->
		<ng-template #author>
			<div class="flex items-center gap-2">
				<ngx-skeleton-loader [theme]="avatarTheme" appearance="circle" count="1" class="flex items-center" />
				<ngx-skeleton-loader [theme]="lineTheme" appearance="line" count="1" class="w-full max-w-40" />
			</div>
		</ng-template>
	`,
	styles: `
		@reference '#tailwind-theme';

		:host {
			@apply block;
		}

		:host ::ng-deep .cover-skeleton .skeleton-loader,
		:host ::ng-deep .title-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserV3SkeletonComponent {
	// Inputs (espejo de StoryCardTeaserV3Component)
	readonly variant = input<StoryCardTeaserV3Variant>('on-white');
	readonly order = input<number>();
	readonly showAuthor = input<boolean>(false);
	readonly showDescription = input<boolean>(false);
	readonly showMultimedia = input<boolean>(false);
	readonly excerptLines = input<number>(2);

	// Placeholders de los selectores de multimedia (YouTube, X, Spotify).
	protected readonly mediaPlaceholders = [0, 1, 2];

	// Temas de ngx-skeleton-loader.
	protected readonly coverTheme = { height: '164px', width: '118px', 'border-radius': '8px', margin: '0' };
	protected readonly avatarTheme = { height: '24px', width: '24px', margin: '0' };
	protected readonly titleTheme = { height: '24px', 'margin-bottom': '0' };
	protected readonly lineTheme = { height: '16px', 'margin-bottom': '0' };
	protected readonly mediaTheme = { height: '34px', width: '38px', 'border-radius': '8px', margin: '0' };

	readonly descriptionLines = computed(() => Array(this.excerptLines()).fill(0));

	readonly rowWrapperClasses = computed(() =>
		this.variant() === 'highlighted'
			? 'flex w-full max-w-178.75 items-start gap-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-6'
			: 'flex w-full max-w-178.75 items-start gap-6',
	);

	readonly rowColumnClasses = computed(() => {
		const base = 'flex min-w-0 flex-1 flex-col justify-center gap-3';
		return this.variant() === 'highlighted' ? base : `${base} pt-1`;
	});
}
