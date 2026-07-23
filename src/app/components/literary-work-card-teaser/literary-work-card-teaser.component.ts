import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { LiteraryWorkNavigationTeaserWithAuthors, LiteraryWorkTeaser } from '@models/literary-work.model';
import { AppRoutes } from '../../app.routes';
import { BypassHtmlSanitizerPipe } from '../../pipes/bypass-html-sanitizer.pipe';
import { LiteraryWorkCardTeaserSkeletonComponent } from './literary-work-card-teaser-skeleton.component';
import { ImageProfileComponent } from '../image-profile/image-profile.component';
import { CoverImageComponent } from '../cover-image/cover-image.component';

/**
 * Variantes visuales del componente LiteraryWorkCardTeaser definidas en el Design System v3.
 *
 * - `on-white`: layout horizontal con imagen a la izquierda, pensado para fondos blancos.
 * - `on-gray`: idéntico a `on-white`, pensado para fondos grises.
 * - `highlighted`: tarjeta destacada con borde y fondo, con la imagen a la derecha.
 */
export type LiteraryWorkCardTeaserVariant = 'on-white' | 'on-gray' | 'highlighted';

@Component({
	selector: 'cuentoneta-literary-work-card-teaser',
	imports: [
		NgTemplateOutlet,
		RouterLink,
		BypassHtmlSanitizerPipe,
		LiteraryWorkCardTeaserSkeletonComponent,
		ImageProfileComponent,
		CoverImageComponent,
	],
	template: `
		@if (literaryWork(); as literaryWork) {
			<article [class]="rowWrapperClasses()">
				<ng-container [ngTemplateOutlet]="cover" />
				<div [class]="rowColumnClasses()">
					@if (showAuthor() && literaryWork.authors.length > 0) {
						@for (author of literaryWork.authors; track author.slug) {
							<ng-container [ngTemplateOutlet]="authorBlock" [ngTemplateOutletContext]="{ $implicit: author }" />
						}
					}
					<div class="flex w-full flex-col gap-2">
						<!-- Enlace de la obra estirado con ::after para cubrir toda la tarjeta (sin wrapper <a>). -->
						<a
							[routerLink]="literaryWorkRouterLink()"
							[queryParams]="navigationParams()"
							[attr.aria-label]="literaryWork.title"
							class="flex w-full flex-col gap-1 after:absolute after:inset-0 after:content-['']"
						>
							<p class="line-clamp-2 font-inter text-xl font-bold text-neutral-900">
								@if (order() !== undefined) {
									<span class="source-serif-2-5xl font-bold text-brand-500">{{ order() }}. </span>
								}
								<span>{{ literaryWork.title }}</span>
							</p>
							@if (showExcerpt() && 'teaserSection' in literaryWork) {
								<div
									[innerHTML]="literaryWork.teaserSection.bodyHtml | bypassHtmlSanitizer"
									[class]="'line-clamp-' + excerptLines()"
									data-testid="description"
									class="overflow-hidden font-inter text-sm font-medium text-ellipsis text-neutral-600"
								></div>
							}
						</a>
						<ng-container [ngTemplateOutlet]="readingTime" [ngTemplateOutletContext]="{ $implicit: literaryWork }" />
					</div>
				</div>
			</article>
		} @else {
			<cuentoneta-literary-work-card-teaser-skeleton
				[variant]="variant()"
				[order]="order()"
				[showAuthor]="showAuthor()"
				[showExcerpt]="showExcerpt()"
				[excerptLines]="excerptLines()"
				data-testid="skeleton"
			/>
		}

		<!-- Portada: la posiciona la tarjeta (en highlighted va a la derecha con order-last; en el resto,
			 a la izquierda). El manejo de imagen/placeholder vive en CoverImageComponent. -->
		<ng-template #cover>
			<cuentoneta-cover-image
				[src]="coverImageUrl()"
				[priority]="priority()"
				[class.order-last]="variant() === 'highlighted'"
			/>
		</ng-template>

		<!-- Autor: avatar pequeño + nombre, repetido por cada integrante de la autoría 1..N. Implementación
			 propia del card (Design System v3): no usa AuthorTeaserV3. Es un enlace propio al perfil del autor,
			 elevado con z-10 para quedar por encima del enlace de la obra (que se estira sobre toda la tarjeta). -->
		<ng-template #authorBlock let-author>
			<a
				[routerLink]="['/', appRoutes.Author, author.slug]"
				class="group relative z-10 flex min-w-0 items-center gap-2"
				data-testid="author"
			>
				<cuentoneta-image-profile [src]="author.imageUrl" size="small" class="shrink-0" />
				<span class="truncate font-inter text-sm font-medium text-neutral-900 group-hover:underline">{{
					author.name
				}}</span>
			</a>
		</ng-template>

		<!-- Etiqueta opcional, separador y tiempo de lectura -->
		<ng-template #readingTime let-literaryWork>
			<div class="flex items-center gap-2" data-testid="reading-time">
				@if (tagLabel()) {
					<span class="font-inter text-xs font-bold text-brand-500">{{ tagLabel() }}</span>
					<span class="font-inter text-xxs font-medium text-neutral-600" aria-hidden="true">•</span>
				}
				<span class="font-inter text-xs font-medium text-neutral-600">
					{{ literaryWork.totalReadingTime }} minutos de lectura
				</span>
			</div>
		</ng-template>
	`,
	host: {
		class: 'block',
	},
})
export class LiteraryWorkCardTeaserComponent {
	protected readonly appRoutes = AppRoutes;

	// Inputs
	public readonly literaryWork = input<LiteraryWorkNavigationTeaserWithAuthors | LiteraryWorkTeaser>();
	public readonly variant = input<LiteraryWorkCardTeaserVariant>('on-white');
	public readonly order = input<number>();
	// Marca el cover como prioritario (above-the-fold, p. ej. en la variante highlighted como hero).
	public readonly priority = input<boolean>(false);
	public readonly tagLabel = input<string>();
	public readonly showAuthor = input<boolean>(false);
	public readonly showExcerpt = input<boolean>(false);
	// Acotado a [1, 10] para coincidir con el safelist `line-clamp-{1..10}` de styles.css,
	// ya que la clase `line-clamp-N` se construye dinámicamente y no la detecta el escaneo de Tailwind.
	public readonly excerptLines = input(2, { transform: (value: number) => Math.min(10, Math.max(1, value)) });
	public readonly navigationParams = input<{ navigation: string; navigationSlug: string }>();

	protected readonly coverImageUrl = computed(() => this.literaryWork()?.coverImage);
	protected readonly literaryWorkRouterLink = computed(() => ['/', this.appRoutes.Read, this.literaryWork()?.slug]);

	protected readonly rowWrapperClasses = computed(() =>
		this.variant() === 'highlighted'
			? 'relative flex w-full max-w-178.75 items-start gap-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-6'
			: 'relative flex w-full max-w-178.75 items-start gap-6',
	);

	protected readonly rowColumnClasses = computed(() => {
		const base = 'flex min-w-0 flex-1 flex-col justify-center gap-3';
		return this.variant() === 'highlighted' ? base : `${base} pt-1`;
	});
}
