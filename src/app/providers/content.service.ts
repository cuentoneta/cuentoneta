// Core
import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, tap } from 'rxjs';

// Interfaces
import { ContentConfig, StorylistCardDeck } from '../models/content.model';
import { StoryList } from '../models/storylist.model';

// Providers
import { StoryService } from './story.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ContentService {
    private _contentConfig!: ContentConfig;

    // Services
    private httpClient = inject(HttpClient);
    private storyService = inject(StoryService);

    get contentConfig(): ContentConfig {
        return this._contentConfig;
    }

    public fetchContentConfig(): Observable<ContentConfig> {
        return of(environment.contentConfig).pipe(
            tap((contentConfig) => {
                this._contentConfig = contentConfig;
            })
        );
    }

    // ToDo: Obtener listas de navs desde API
    public getNavLists(): Pick<StoryList, 'slug' | 'title'>[] {
        return [
            { slug: 'fec-english-sessions', title: 'FEC English Sessions' },
            { slug: 'verano-2022', title: 'Cuentos Verano 2022' },
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
        const configs = this.contentConfig.storylistDeckConfigs;
        return combineLatest(
            [...configs].map((storylist) => this.storyService.getLatest(storylist.slug, storylist.amount))
        ).pipe(
            map((storylists) =>
                configs.map(
                    (storylistConfig): StorylistCardDeck => ({
                        ...storylistConfig,
                        storylist: storylists
                            .filter((storylist) => storylist.slug === storylistConfig.slug)
                            .pop() as StoryList,
                    })
                )
            )
        );
    }
}
