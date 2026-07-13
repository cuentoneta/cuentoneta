import { Component, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { UrlTree } from '@angular/router';

// Models
import { StoryNavigationTeaserWithAuthor } from '@models/story.model';

// Routes
import { AppRoutes } from '../../app.routes';
import { NavigationFrameComponent } from '@models/navigation-frame.component';

// Services
import { StorylistApi } from '../../providers/storylist-api.interface';

// Componentes
import { progressiveRxResource } from '@utils/ssr-resource';
import { NavigableStorylistStoryTeaserComponent } from '@components/navigable-storylist-story-teaser/navigable-storylist-story-teaser.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

export type NavigationBarConfig = {
	headerTitle: string;
	footerTitle: string;
	navigationRoute: UrlTree | string;
	showFooter: boolean;
};

@Component({
	selector: 'cuentoneta-storylist-navigation-frame',
	imports: [SkeletonComponent, NavigableStorylistStoryTeaserComponent],
	host: {
		class: 'grid grid-cols-1 gap-y-0.5 rounded-xl bg-neutral-200 shadow-lg',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
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
				<article [attr.aria-busy]="true" class="flex flex-col gap-2 bg-neutral-50 px-7 py-5">
					<cuentoneta-skeleton appearance="line" class="h-4 w-full bg-neutral-300" />
					<cuentoneta-skeleton appearance="line" class="h-4 w-full bg-neutral-300" />
				</article>
			}
		}`,
})
export class StorylistNavigationFrameComponent extends NavigationFrameComponent {
	// Routes
	private readonly appRoutes = AppRoutes;

	// Providers
	private storylistService = inject(StorylistApi);

	// Recursos
	private readonly storylistResource = progressiveRxResource({
		params: () => this.navigationSlug() || undefined,
		stream: ({ params }) => this.storylistService.getStorylistNavigationTeasers(params),
		defaultValue: undefined,
	});

	// Propiedades
	protected displayedStories: StoryNavigationTeaserWithAuthor[] = [];
	protected dummyList: null[] = Array(9);
	protected readonly storylist = computed(() => this.storylistResource.value());

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
	private sliceDisplayedStories(stories: StoryNavigationTeaserWithAuthor[]): void {
		if (!this.storylist()) {
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
