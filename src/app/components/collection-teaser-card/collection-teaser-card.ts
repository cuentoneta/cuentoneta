// Core
import { Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

// Router
import { RouterLink } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// Models
import type { CollectionTeaser } from '@models/collection.model';

// Components
import { CollectionCover } from '../collection-cover/collection-cover';

@Component({
	selector: 'cuentoneta-collection-teaser-card',
	imports: [NgTemplateOutlet, RouterLink, CollectionCover],

	template: `
		<article class="relative flex items-start gap-5">
			@if (collection(); as collection) {
				<section class="flex h-48 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3 sm:flex-1">
					<cuentoneta-collection-cover [imagery]="collection.imagery" />
				</section>
				<section class="flex flex-1 flex-col gap-1 overflow-hidden">
					@if (headingLevel() === 3) {
						<h3 [class]="titleClasses">
							<ng-container [ngTemplateOutlet]="titleLink" />
						</h3>
					} @else {
						<h2 [class]="titleClasses">
							<ng-container [ngTemplateOutlet]="titleLink" />
						</h2>
					}
					<ng-template #titleLink>
						<a
							[routerLink]="['/' + appRoutes.Collection, collection.slug]"
							class="hover:text-interactive-500 after:absolute after:inset-0 after:content-['']"
						>
							{{ collection.title }}
						</a>
					</ng-template>
					<div
						[innerHTML]="safeDescription()"
						class="line-clamp-4 font-inter text-sm text-ellipsis text-neutral-700"
						data-markdown
						data-testid="description"
					></div>
					<footer class="flex flex-col gap-1 font-inter text-xs text-neutral-600 sm:flex-row">
						@if (collection.tags[0]; as tag) {
							<span class="font-inter text-xs font-bold text-brand-500">
								{{ tag.title }}
								@if (collection.tags.length > 1) {
									+{{ collection.tags.length - 1 }}
								}
							</span>
							<span class="hidden sm:inline">•</span>
						}
						<span>{{ collection.count }} {{ collection.count === 1 ? 'obra' : 'obras' }}</span>
					</footer>
				</section>
			}
		</article>
	`,
})
export class CollectionTeaserCard {
	private readonly appRoutes = AppRoutes;
	private readonly sanitizer = inject(DomSanitizer);

	public readonly collection = input<CollectionTeaser>();
	// 2 cuando la tarjeta cuelga del <h1> de la página; 3 cuando cuelga del encabezado de una sección.
	public readonly headingLevel = input<2 | 3>(2);

	private readonly titleClasses = 'line-clamp-2 font-inter text-lg leading-6 font-bold text-neutral-900';

	private readonly safeDescription = computed(() => {
		const collection = this.collection();
		return collection ? this.sanitizer.bypassSecurityTrustHtml(collection.description) : undefined;
	});
}
