// Core
import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, tap } from 'rxjs';

// Interfaces
import { StorylistCardDeck, StorylistDeckConfig } from '../models/content.model';
import { StoryList } from '../models/storylist.model';

// Providers
import { environment } from '../environments/environment';
import { StorylistService } from '../storylist.service';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private _contentConfig!: StorylistDeckConfig[];

  // Services
  private storyListService = inject(StorylistService);

  get contentConfig(): StorylistDeckConfig[] {
    return this._contentConfig;
  }

  public fetchContentConfig(): Observable<StorylistDeckConfig[]> {
    return of(environment.contentConfig as StorylistDeckConfig[]).pipe(
      tap((contentConfig) => {
        this._contentConfig = contentConfig;
      })
    );
  }

  // ToDo: Obtener listas de navs desde API
  public getNavLists(): Pick<StoryList, 'slug' | 'title'>[] {
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
    const configs = this.contentConfig;
    return combineLatest(
      [...configs].map((storylistDeckConfig) =>
        this.storyListService
          .get(
            storylistDeckConfig.slug,
            storylistDeckConfig.amount,
              storylistDeckConfig.ordering ?? 'desc'
          )
          .pipe(
            map(
              (storylist: StoryList): StoryList => ({
                ...storylist,
                  images: storylist.previewImages,
                  gridConfig: storylist.previewGridConfig
              })
            )
          )
      )
    ).pipe(
      map((storylists) =>
        configs.map(
          (contentConfig): StorylistCardDeck => ({
            ...contentConfig,
            storylist: storylists
              .filter((storylist) => storylist.slug === contentConfig.slug)
              .pop() as StoryList,
          })
        )
      )
    );
  }
}
