// Core
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// Interfaces
import { LandingPageContent } from '@models/landing-page-content.model';

import { Storylist } from '@models/storylist.model';
// Providers
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class ContentService {
	private readonly prefix = `${environment.apiUrl}api/content`;

	// Services
	private http = inject(HttpClient);

	public getLandingPageContent(): Observable<LandingPageContent> {
		return this.http.get<LandingPageContent>(`${this.prefix}/landing-page`).pipe(
			map((content) => ({
				cards: content.cards,
				previews: content.cards,
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
	public fetchStorylistDecks(): Observable<LandingPageContent> {
		return this.getLandingPageContent().pipe(
			map(({ previews, cards }) => {
				return {
					previews: previews,
					cards: cards,
				};
			}),
		);
	}
}
