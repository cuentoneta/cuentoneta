// Core
import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

// Interfaces
import { StorylistCardDeck, StorylistDeckConfig } from '@models/content.model';
import { Storylist } from '@models/storylist.model';

// Providers
import { environment } from '../environments/environment';
import { StorylistService } from './storylist.service';

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
	private storylistService = inject(StorylistService);

	get contentConfig(): LandingPageContent {
		return this._contentConfig;
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
	 * una tupa de arrays de objetos compuestos de tipo StorylistCardDeck, los cuales
	 * contienen la configuración y la correspondiente información para renderizar
	 * los decks de previews y cards de cada storylist.
	 */
	public fetchStorylistDecks(): Observable<[StorylistCardDeck[], StorylistCardDeck[]]> {
		const previewConfigs = this.contentConfig.previews;
		const cardConfigs = this.contentConfig.cards;

		const previewConfigs$ = combineLatest(
			[...previewConfigs].map((config) => this.storylistService.getPreview(config.slug)),
		);

		const cardConfigs$ = combineLatest([...cardConfigs].map((config) => this.storylistService.getPreview(config.slug)));

		return combineLatest([previewConfigs$, cardConfigs$]).pipe(
			switchMap(([previews, cards]) => {
				return of([
					previewConfigs.map(
						(contentConfig): StorylistCardDeck => ({
							...contentConfig,
							storylist: previews.filter((storylist) => storylist.slug === contentConfig.slug).pop() as Storylist,
						}),
					),
					cardConfigs.map(
						(contentConfig): StorylistCardDeck => ({
							...contentConfig,
							storylist: cards.filter((storylist) => storylist.slug === contentConfig.slug).pop() as Storylist,
						}),
					),
				]);
			}),
		) as Observable<[StorylistCardDeck[], StorylistCardDeck[]]>;
	}
}
