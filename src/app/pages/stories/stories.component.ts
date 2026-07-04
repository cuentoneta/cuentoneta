// Core
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ssrBlockingRxResource } from '@utils/ssr-resource';

// Services
import { StoryApi } from '../../providers/story-api.interface';

// Directives
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';

// Environment
import { environment } from '../../environments/environment';

// Routing
import { AppRoutes } from '../../app.routes';

@Component({
	selector: 'cuentoneta-stories',
	standalone: true,
	imports: [RouterLink],
	hostDirectives: [HeadMetadataDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<main class="content vertical-layout-spacing horizontal-layout-spacing">
			<article class="grid grid-cols-1 gap-8">
				<section class="flex flex-col gap-4">
					<h1 class="font-inter text-xl font-bold">Todas las Historias</h1>
					<p class="font-inter text-base text-neutral-600">
						Explora nuestra colección completa de historias de La Cuentoneta
					</p>
				</section>

				<div class="overflow-x-auto rounded-lg border border-neutral-200">
					<table class="w-full border-collapse">
						<thead class="bg-neutral-50">
							<tr class="border-b border-neutral-200">
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Título</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Autor</th>
								<th class="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Tiempo de lectura</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-neutral-200">
							@for (story of stories(); track story._id) {
								<tr class="transition-colors hover:bg-neutral-50">
									<td class="px-6 py-4">
										<a
											[routerLink]="['/', appRoutes.Story, story.slug]"
											class="text-blue-600 hover:text-blue-800 hover:underline"
										>
											{{ story.title }}
										</a>
									</td>
									<td class="px-6 py-4 text-neutral-700">
										<a
											[routerLink]="['/', appRoutes.Author, story.author.slug]"
											class="text-blue-600 hover:text-blue-800 hover:underline"
										>
											{{ story.author.name }}
										</a>
									</td>
									<td class="px-6 py-4 text-neutral-700">{{ story.approximateReadingTime }} min</td>
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
	private storyService = inject(StoryApi);
	private metaTagsDirective = inject(HeadMetadataDirective);

	// TODO: Implementar tamaño de página variable
	private readonly storiesResource = ssrBlockingRxResource({
		stream: () => this.storyService.get(0, 2000),
		defaultValue: [],
	});

	protected readonly stories = computed(() => this.storiesResource.value());

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
}
