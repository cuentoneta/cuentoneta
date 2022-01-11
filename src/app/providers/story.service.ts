import { Injectable } from '@angular/core';
import { Paragraph, StoryModel } from '../models/story.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoryService {
    get count(): number {
        return this._count;
    }

    private _count: number = 0;

    constructor(private http: HttpClient) {}

    get(day: number): Observable<StoryModel> {
        return this.http.get<StoryModel>(`${environment.apiUrl}/api/story/${day}`);
    }

    getAuthors(): Observable<any> {
        return this.http.get<StoryModel[]>(`${environment.apiUrl}/api/story/authors`);
    }

    public async setCount() {
        this._count = await this.http.get<number>(`${environment.apiUrl}/api/story/count`).toPromise();
    }

    // TODO: #60 Cambiar por parsing vía librerías de Sanity
    parseParagraph(block): Paragraph {
        return { text: block.children[0].text, italics: block.children[0].marks.includes('em') };
    }

    // TODO: #60 Cambiar por parsing vía librerías de Sanity
    parseSummary(block): string {
        return block.children[0].text;
    }
}
