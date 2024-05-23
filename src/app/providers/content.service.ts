// Core
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';

// Interfaces
import { StorylistCardDeck, StorylistDeckConfig } from '@models/content.model';
import { Storylist } from '@models/storylist.model';

// Providers
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

interface LandingPageContent {
	cards: StorylistDeckConfig[];
	previews: StorylistDeckConfig[];
}

@Injectable({
	providedIn: 'root',
})
export class ContentService {
	private readonly prefix = `${environment.apiUrl}api/content`;
	private _contentConfig: LandingPageContent = { cards: [], previews: [] };

	// Services
	private http = inject(HttpClient);

	get contentConfig(): LandingPageContent {
		return this._contentConfig;
	}

	public getLandingPageContent(): Observable<{ cards: Storylist[]; previews: Storylist[] }> {
		return this.http.get<{ cards: Storylist[]; previews: Storylist[] }>(`${this.prefix}/landing-page`);
	}

	public fetchContentConfig(): Observable<LandingPageContent> {
		return of(environment.contentConfig as LandingPageContent).pipe(
			tap((contentConfig) => {
				this._contentConfig = contentConfig;
			}),
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
	 * En base a la configuración de contenido disponible, hace fetch de la lista de
	 * storylists referenciada en los objetos de configuración, para luego generar
	 * una tupla de arrays de objetos compuestos de tipo StorylistCardDeck, los cuales
	 * contienen la configuración y la correspondiente información para renderizar
	 * los decks de previews y cards de cada storylist.
	 */
	public fetchStorylistDecks(): Observable<{ previews: StorylistCardDeck[]; cards: StorylistCardDeck[] }> {
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
