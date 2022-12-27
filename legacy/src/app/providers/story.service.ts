import { Injectable } from '@angular/core';
import { StoryModel } from '../models/story.model';
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

    public get(day: number): Observable<StoryModel> {
        return this.http.get<StoryModel>(`${environment.apiUrl}/api/story/${day}`);
    }

    public getAuthors(): Observable<StoryModel[]> {
        return this.http.get<StoryModel[]>(`${environment.apiUrl}/api/story/authors`);
    }

    public getOriginalLinks(): Observable<any> {
        return this.http.get<StoryModel[]>(`${environment.apiUrl}/api/story/original-links`);
    }

    public async setCount() {
        this._count = await this.http.get<number>(`${environment.apiUrl}/api/story/count`).toPromise();
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
