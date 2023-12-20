// Core
import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, tap } from 'rxjs';

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
      })
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
   * un array de objetos compuestos de tipo StorylistCardDeck, los cuales contienen
   * la configuración y la correspondiente información para renderizar un deck de
   * cards de cada storylist.
   */
  public fetchStorylistDecks(): Observable<StorylistCardDeck[]> {
    const previewConfigs = this.contentConfig.previews;

    return combineLatest(
      [...previewConfigs].map((config) =>
        this.storylistService.getPreview(config.slug)
      )
    ).pipe(
      map((storylists) =>
        previewConfigs.map(
          (contentConfig): StorylistCardDeck => ({
            ...contentConfig,
            storylist: storylists
              .filter((storylist) => storylist.slug === contentConfig.slug)
              .pop() as Storylist,
          })
        )
      )
    );
  }

  /**
   * De forma similar a fetchStorylistDecks(), este método se encarga de obtener la
   * lista de storylists referenciada en los objetos de configuración para mostrar
   * la información de las mismas en cards en la landing page.
   */
  public fetchStorylistCards(): Observable<StorylistCardDeck[]> {
    const cardConfigs = this.contentConfig.cards;

    return combineLatest(
      [...cardConfigs].map((config) =>
        this.storylistService.getPreview(config.slug)
      )
    ).pipe(
      map((storylists) =>
        cardConfigs.map(
          (contentConfig): StorylistCardDeck => ({
            ...contentConfig,
            storylist: storylists
              .filter((storylist) => storylist.slug === contentConfig.slug)
              .pop() as Storylist,
          })
        )
      )
    );
  }
}
