import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-story-card-teaser-skeleton',
	imports: [NgxSkeletonLoaderModule],
	providers: [ThemeService],
	template: `<article class="flex gap-4">
		@if (order()) {
			<ngx-skeleton-loader
				[theme]="{
					height: '36px',
					'margin-bottom': 0,
					width: '40px',
					'background-color': orderColor,
				}"
				data-testid="show-order"
				count="1"
				appearance="line"
			/>
		}
		<div class="flex flex-1 flex-col gap-1">
			@if (showAuthor()) {
				<div class="flex items-center gap-2" data-testid="show-author">
					<ngx-skeleton-loader
						[theme]="{
							height: '20px',
							margin: 0,
							width: '20px',
						}"
						count="1"
						appearance="circle"
						class="flex items-center"
					/>
					<ngx-skeleton-loader
						[theme]="{
							height: '20px',
							'margin-bottom': 0,
							'max-width': '160px',
						}"
						class="w-full"
						count="1"
						appearance="line"
					/>
				</div>
			}
			<div class="flex flex-col gap-1">
				<ngx-skeleton-loader
					[theme]="{
						height: '32px',
						'margin-bottom': 0,
						'max-width': '192px',
						'background-color': skeletonTextColor,
					}"
					class="w-full"
					count="1"
					appearance="line"
				/>
				@if (showExcerpt()) {
					<div class="flex flex-col gap-1" data-testid="show-excerpt">
						@for (line of excerptArrayLines(); track $index) {
							<ngx-skeleton-loader
								[attr.data-testid]="'excerpt-skeleton-line-' + $index"
								[theme]="{
									height: '16px',
									'margin-top': $index === 0 ? '2px' : '0px',
									'margin-bottom': $index === excerptLines() - 1 ? '6px' : '4px',
									width: $index === excerptLines() - 1 ? '80%' : '100%',
								}"
								count="1"
								appearance="line"
							/>
						}
					</div>
				}
				<footer class="inter-body-xs flex gap-1 text-gray-500">
					<ngx-skeleton-loader
						[theme]="{
							height: '16px',
							'margin-bottom': 0,
							width: '120px',
						}"
						count="1"
						appearance="line"
					/>
					<span>•</span>
					<ngx-skeleton-loader
						[theme]="{
							height: '16px',
							'margin-bottom': 0,
							width: '40px',
						}"
						count="1"
						appearance="line"
					/>
				</footer>
			</div>
		</div>
	</article>`,
	styles: `
		:host {
			@apply w-full;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardTeaserSkeletonComponent {
	// Inputs
	readonly order = input<number>();
	readonly showAuthor = input<boolean>(false);
	readonly showExcerpt = input<boolean>(false);
	readonly excerptLines = input<number>(3);

	// Usado de auxiliar para iterar a través de la cantidad de líneas del extracto de texto
	readonly excerptArrayLines = computed(() => Array(this.excerptLines()).fill(0));

	// Providers
	skeletonTextColor = inject(ThemeService).pickColor('zinc', 300);
	orderColor = inject(ThemeService).pickThemeColor('primary-300');
}
