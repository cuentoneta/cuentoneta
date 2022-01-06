import { Injectable } from '@angular/core';
import { Paragraph, StoryModel } from '../models/story.model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoryService {
    constructor(private http: HttpClient) {}

    get(day: number): Observable<StoryModel> {
        return this.http.get<StoryModel>(`${environment.apiUrl}/story/${day}`);
    }

    getAuthors(): Observable<any> {
        return this.http.get<StoryModel[]>(`${environment.apiUrl}/story/authors`);
    }

    getCount(): number {
        return 5;
    }

    parseParagraph(block): Paragraph {
        return { text: block.children[0].text, italics: block.children[0].marks.includes('em') };
    }

    parseSummary(block): string {
        return block.children[0].text;
    }
}
