// Core
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services
import { StoryService } from '../../providers/story.service';
import { ThemeService } from '../../providers/theme.service';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Environment
import { environment } from '../../environments/environment';

// Routing
import { AppRoutes } from '../../app.routes';

// 3rd Party
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
	selector: 'cuentoneta-stories',
	standalone: true,
	imports: [CommonModule, RouterLink, NgxSkeletonLoaderModule],
	hostDirectives: [MetaTagsDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<main class="content vertical-layout-spacing horizontal-layout-spacing">
			<article class="grid grid-cols-1 gap-8">
				<section class="flex flex-col gap-4">
					<h1 class="inter-body-xl font-bold">Todas las Historias</h1>
					<p class="inter-body-md text-gray-600">Explora nuestra colección completa de historias de La Cuentoneta</p>
				</section>

				<div class="border overflow-x-auto rounded-lg border-gray-200">
					<table class="w-full border-collapse">
						<thead class="bg-gray-50">
							<tr class="border-b border-gray-200">
								<th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Título</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Autor</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tiempo de lectura</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							@for (story of stories(); track story._id) {
								<tr class="transition-colors hover:bg-gray-50">
									<td class="px-6 py-4">
										<a
											[routerLink]="['/', appRoutes.Story, story.slug]"
											class="text-blue-600 hover:text-blue-800 hover:underline"
										>
											{{ story.title }}
										</a>
									</td>
									<td class="px-6 py-4 text-gray-700">
										<a
											[routerLink]="['/', appRoutes.Author, story.author.slug]"
											class="text-blue-600 hover:text-blue-800 hover:underline"
										>
											{{ story.author.name }}
										</a>
									</td>
									<td class="px-6 py-4 text-gray-700">{{ story.approximateReadingTime }} min</td>
								</tr>
							}
						</tbody>
					</table>
				</div>
			</article>
		</main>
	`,
})
export default class StoriesComponent {
	protected readonly appRoutes = AppRoutes;
	private storyService = inject(StoryService);
	private metaTagsDirective = inject(MetaTagsDirective);
	skeletonColor = inject(ThemeService).pickColor('zinc', 300);

	// TODO: Implementar tamaño de página variable
	readonly storiesResource = rxResource({
		stream: () => this.storyService.get(0, 2000),
		defaultValue: [],
	});

	readonly stories = computed(() => this.storiesResource.value());

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		this.metaTagsDirective.setTitle('Todas las Historias - La Cuentoneta');
		this.metaTagsDirective.setDescription(
			'Explora la colección completa de historias publicadas en La Cuentoneta y descubre nuevos autores y lecturas',
		);
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}/${this.appRoutes.Story}`);
		this.metaTagsDirective.setRobots('noindex, follow');
	}

	protected readonly AppRoutes = AppRoutes;
}
