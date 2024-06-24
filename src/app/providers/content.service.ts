// Core
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// Interfaces
import { StorylistCardDeck, StorylistDeckConfig } from '@models/content.model';
import { LandingPageContent } from '@models/landing-page-content.model';

import { Storylist, StorylistDTO } from '@models/storylist.model';
// Providers
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StorylistService } from './storylist.service';

@Injectable({
	providedIn: 'root',
})
export class ContentService {
	private readonly prefix = `${environment.apiUrl}api/content`;

	// Services
	private http = inject(HttpClient);
	private storylistService = inject(StorylistService);

	get contentConfig(): LandingPageContent<StorylistDeckConfig> {
		return environment.contentConfig as LandingPageContent<StorylistDeckConfig>;
	}

	public getLandingPageContent(): Observable<LandingPageContent<Storylist>> {
		return this.http.get<LandingPageContent<StorylistDTO>>(`${this.prefix}/landing-page`).pipe(
			map((content) => ({
				cards: content.cards.map((cards) => this.storylistService.mapStorylist(cards)),
				previews: content.previews.map((preview) => this.storylistService.mapStorylist(preview)),
			})),
		);
	}

	// ToDo: Obtener listas de navs desde API
	public getNavLists(): Pick<Storylist, 'slug' | 'title'>[] {
		return [
			{ slug: 'otono-2023', title: 'Cuentos de Otoño' },
			{ slug: 'fec-english-sessions', title: 'FEC English Sessions' },
			{ slug: 'verano-2022', title: 'La Cuentoneta 1.0' },
		];
	}

	/**
	 * Hace fetch de la configuración de landing page desde el origen de datos y genera
	 * una tupla de arrays de objetos compuestos de tipo StorylistCardDeck, los cuales
	 * contienen la configuración y la correspondiente información para renderizar
	 * los decks de previews y cards de cada storylist.
	 */
	public fetchStorylistDecks(): Observable<LandingPageContent<StorylistCardDeck>> {
		const previewConfigs = this.contentConfig.previews;
		const cardConfigs = this.contentConfig.cards;
		const landingConfig$ = this.getLandingPageContent();

		return landingConfig$.pipe(
			map(({ previews, cards }) => {
				return {
					previews: previewConfigs.map(
						(contentConfig): StorylistCardDeck => ({
							...contentConfig,
							storylist: previews.filter((storylist) => storylist.slug === contentConfig.slug).pop() as Storylist,
						}),
					),
					cards: cardConfigs.map(
						(contentConfig): StorylistCardDeck => ({
							...contentConfig,
							storylist: cards.filter((storylist) => storylist.slug === contentConfig.slug).pop() as Storylist,
						}),
					),
				};
			}),
		);
	}
}
