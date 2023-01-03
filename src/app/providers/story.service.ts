import { Injectable } from '@angular/core';
import { StoryModel } from '../models/story.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoryService {
    get count(): number {
        return this._count;
    }

    set count(value) {
        this._count = value;
    }

    private _count: number = 0;

    constructor(private http: HttpClient) {}

    public get(day: number | string, edition: number | string): Observable<StoryModel> {
        const params = new HttpParams().set('day', day).set('edition', edition);
        return this.http.get<StoryModel>(`${environment.apiUrl}/api/story`, { params });
    }

    public latest(): Observable<StoryModel> {
        return this.http.get<StoryModel>(`${environment.apiUrl}/api/story/latest`);
    }

    public getAuthors(edition: string | number): Observable<StoryModel[]> {
        const params = new HttpParams().set('edition', edition);
        return this.http.get<StoryModel[]>(`${environment.apiUrl}/api/story/authors`, { params });
    }

    public getOriginalLinks(): Observable<any> {
        return this.http.get<StoryModel[]>(`${environment.apiUrl}/api/story/original-links`);
    }

    public getCount(edition: string | number): Observable<number> {
        const params = new HttpParams().set('edition', edition);
        return this.http.get<number>(`${environment.apiUrl}/api/story/count`, { params });
    }

    public load(story): StoryModel {
        return {
            ...story,
            prologues: story.prologues,
            paragraphs: story.paragraphs.map((x) => this.parseParagraph(x)),
            summary: story.summary.map((x) => this.parseSummary(x)).pop(),
        };
    }

    public parseParagraph(block): string {
        let paragraph = '';
        block.children.forEach((x) => {
            let part = x.text;
            if (x.marks.includes('em')) {
                part = this.addEmphasis(part);
            }
            if (x.marks.includes('strong')) {
                part = this.addStrong(part);
            }
            paragraph = paragraph.concat(part);
        });
        return paragraph;
    }
    public parseSummary(block): string {
        return block.children[0].text;
    }

    private addEmphasis(text: string): string {
        return `<i>${text}</i>`;
    }

    private addStrong(text: string): string {
        return `<strong>${text}</strong>`;
    }
}
