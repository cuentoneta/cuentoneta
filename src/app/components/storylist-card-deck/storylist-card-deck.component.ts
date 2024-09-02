// Core
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

// Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';

// Models
import { Storylist } from '@models/storylist.model';
import { AppRoutes } from '../../app.routes';

// Components
import { PublicationCardComponent } from '../publication-card/publication-card.component';
import { ThemeService } from '../../providers/theme.service';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-storylist-card-deck',
	standalone: true,
	imports: [
		CommonModule,
		NgxSkeletonLoaderModule,
		RouterLink,
		PublicationCardComponent,
		StoryCardSkeletonComponent,
		PortableTextParserComponent,
	],
	templateUrl: './storylist-card-deck.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistCardDeckComponent {
	number = input<number>(6);
	storylist = input<Storylist>();
	isLoading = input<boolean>(false); // Utilizado para mostrar/ocultar skeletons
	canNavigateToStorylist = input<boolean>(false);
	displayTitle = input<boolean>(true);
	displayFeaturedImage = input<boolean>(true);

	public router = inject(Router);
	readonly appRoutes = AppRoutes;

	private themeService = inject(ThemeService);
	skeletonColor = this.themeService.pickColor('zinc', 300);
}
