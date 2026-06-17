import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

/**
 * Skeleton de carga de `AuthorTeaserV3`: reproduce su layout (avatar circular de 80px + columna con
 * tags, nombre y cantidad de historias) mientras se cargan los datos del autor.
 */
@Component({
	selector: 'cuentoneta-author-teaser-v3-skeleton',
	imports: [NgxSkeletonLoaderModule],
	host: { class: 'block w-full' },
	template: `
		<article class="flex items-start gap-4">
			<ngx-skeleton-loader
				[theme]="{ height: '80px', width: '80px', margin: 0 }"
				count="1"
				appearance="circle"
				class="avatar-skeleton flex shrink-0"
			/>
			<div class="flex min-w-0 flex-1 flex-col gap-1 pt-1">
				<div class="flex flex-wrap items-center gap-1.5">
					<ngx-skeleton-loader
						[theme]="{ height: '22px', width: '72px', 'margin-bottom': 0, 'border-radius': '4px' }"
						count="1"
						appearance="line"
						class="tag-skeleton"
					/>
					<ngx-skeleton-loader
						[theme]="{ height: '22px', width: '72px', 'margin-bottom': 0, 'border-radius': '4px' }"
						count="1"
						appearance="line"
						class="tag-skeleton"
					/>
				</div>
				<ngx-skeleton-loader
					[theme]="{ height: '28px', width: '160px', 'margin-bottom': 0 }"
					count="1"
					appearance="line"
					class="name-skeleton"
				/>
				<ngx-skeleton-loader
					[theme]="{ height: '16px', width: '80px', 'margin-bottom': 0 }"
					count="1"
					appearance="line"
					class="count-skeleton"
				/>
			</div>
		</article>
	`,
	styles: `
		@reference '#tailwind-theme';

		:host ::ng-deep .avatar-skeleton .skeleton-loader,
		:host ::ng-deep .name-skeleton .skeleton-loader,
		:host ::ng-deep .count-skeleton .skeleton-loader {
			@apply bg-neutral-300;
		}

		:host ::ng-deep .tag-skeleton .skeleton-loader {
			@apply bg-brand-100;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorTeaserV3SkeletonComponent {}
