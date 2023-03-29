import { Injectable } from '@angular/core';
import { StoryList } from '../models/storylist.model';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ContentService {
    constructor(private http: HttpClient) {}

    // ToDo: Obtener listas de navs desde API
    public getNavLists(): Pick<StoryList, 'slug' | 'title'>[] {
        return [
            { slug: 'fec-english-sessions', title: 'FEC English Sessions' },
            { slug: 'verano-2022', title: 'Cuentos Verano 2022' },
        ];
    }

    public getStorylists(): Observable<LandingPageContent> {
        return of({
            storylists: [
                {
                    title: 'Otoño 2023',
                    slug: 'otono-2023',
                    highlightFirstRow: true,
                    amount: 5,
                },
                {
                    title: 'Cuentos Verano 2022',
                    slug: 'verano-2022',
                    highlightFirstRow: false,
                    amount: 6,
                },
                {
                    title: 'FEC English Sessions Short Stories',
                    slug: 'fec-english-sessions',
                    highlightFirstRow: true,
                    amount: 5,
                },
            ],
        });
    }
}

export interface LandingPageContent {
    storylists: any;
}
