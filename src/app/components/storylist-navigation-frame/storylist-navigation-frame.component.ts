import { Component, computed, effect, inject } from '@angular/core';
import { UrlTree } from '@angular/router';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';

// Routes
import { AppRoutes } from '../../app.routes';
import { NavigationFrameComponent } from '@models/navigation-frame.component';

// Services
import { StorylistService } from '../../providers/storylist.service';

// Componentes
import { rxResource } from '@angular/core/rxjs-interop';
import { NavigableStorylistStoryTeaserComponent } from '@components/navigable-storylist-story-teaser/navigable-storylist-story-teaser.component';

export type NavigationBarConfig = {
	headerTitle: string;
	footerTitle: string;
	navigationRoute: UrlTree | string;
	showFooter: boolean;
};

@Component({
	selector: 'cuentoneta-storylist-navigation-frame',
	imports: [NgxSkeletonLoaderModule, NavigableStorylistStoryTeaserComponent],
	template: ` @if (storylist(); as storylist) {
			@for (story of displayedStories; track $index) {
				<cuentoneta-navigable-storylist-story-teaser
					[story]="story"
					[selected]="selectedStorySlug() === story.slug"
					[storylist]="storylist"
				/>
			}
		} @else {
			@for (skeleton of dummyList; track $index) {
				<article [attr.aria-busy]="true" class="bg-neutral-50 px-7 py-5">
					<ngx-skeleton-loader count="2" appearance="line" />
				</article>
			}
		}`,
	styles: `
		:host {
			@apply grid grid-cols-1 gap-y-0.5 rounded-xl bg-neutral-200 shadow-lg;
		}
	`,
})
export class StorylistNavigationFrameComponent extends NavigationFrameComponent {
	// Routes
	readonly appRoutes = AppRoutes;

	// Providers
	private storylistService = inject(StorylistService);

	// Recursos
	private readonly storylistResource = rxResource({
		params: () => this.navigationSlug(),
		stream: ({ params }) => this.storylistService.getStorylistNavigationTeasers(params),
		defaultValue: undefined,
	});

	// Propiedades
	displayedStories: StoryNavigationTeaserWithAuthor[] = [];
	dummyList: null[] = Array(9);
	readonly storylist = computed(() => this.storylistResource.value());

	constructor() {
		super();

		effect(() => {
			const storylist = this.storylist();

			if (!storylist) {
				return;
			}

			this.sliceDisplayedStories(storylist.stories);
			this.config.set({
				headerTitle: storylist.title,
				footerTitle: 'Ver más...',
				navigationRoute: this.router.createUrlTree([this.appRoutes.StoryList, storylist.slug]),
				showFooter: true,
			});
		});
	}

	/**
	 * Este método se encarga de mostrar la lista de publicaciones de la navbar en base a la story actualmente en vista.
	 * Si la storylist tiene más de 10 historias, se muestran las 10 historias más cercanas a la story actualmente
	 * en vista tomando las 5 historias anteriores y las 5 siguientes en el caso por defecto y ajustando los límites en
	 * caso de que la story actualmente en vista sea una de las primeras o de las últimas.
	 * @author Ramiro Olivencia <ramiro@olivencia.com.ar>
	 */
	sliceDisplayedStories(stories: StoryNavigationTeaserWithAuthor[]): void {
		if (!this.storylist) {
			return;
		}

		const numberOfDisplayedStories = 9;

		if (stories.length <= numberOfDisplayedStories) {
			this.displayedStories = stories;
			return;
		}

		const selectedStoryIndex = stories.findIndex((story) => story.slug === this.selectedStorySlug());

		const lowerIndex =
			selectedStoryIndex - numberOfDisplayedStories / 2 < 0
				? 0
				: selectedStoryIndex - Math.floor(numberOfDisplayedStories / 2);
		const upperIndex =
			selectedStoryIndex + numberOfDisplayedStories / 2 > stories.length
				? stories.length
				: Math.ceil(selectedStoryIndex + numberOfDisplayedStories / 2);

		this.displayedStories = (this.storylist()?.stories ?? []).slice(
			upperIndex === stories.length ? stories.length - numberOfDisplayedStories : lowerIndex,
			lowerIndex === 0 ? numberOfDisplayedStories : upperIndex,
		);
	}
}
