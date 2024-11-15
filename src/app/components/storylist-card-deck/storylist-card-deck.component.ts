// Core
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

// Modules
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Models
import { Storylist } from '@models/storylist.model';

// Components
import { PublicationCardComponent } from '../publication-card/publication-card.component';
import { StoryCardSkeletonComponent } from '../story-card-skeleton/story-card-skeleton.component';

// Pipes
import { MapPublicationComingNextLabelPipe } from '../../pipes/map-publication-coming-next-label.pipe';
import { MapPublicationEditionLabelPipe } from '../../pipes/map-publication-edition-label.pipe';

// Routing
import { AppRoutes } from '../../app.routes';

// Services
import { ThemeService } from '../../providers/theme.service';

@Component({
	selector: 'cuentoneta-storylist-card-deck',
	standalone: true,
	imports: [
		CommonModule,
		MapPublicationComingNextLabelPipe,
		MapPublicationEditionLabelPipe,
		NgxSkeletonLoaderModule,
		PublicationCardComponent,
		StoryCardSkeletonComponent,
	],
	templateUrl: './storylist-card-deck.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		:host {
			@apply grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8;
		}
	`,
})
export class StorylistCardDeckComponent {
	storylist = input<Storylist>();
	isLoading = input<boolean>(false); // Utilizado para mostrar/ocultar skeletons

	public router = inject(Router);
	readonly appRoutes = AppRoutes;

	skeletonColor = inject(ThemeService).pickColor('zinc', 300);
}
