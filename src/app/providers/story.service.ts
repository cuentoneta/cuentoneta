import { Injectable } from '@angular/core';
import { Story } from '../models/story.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StoryService {
    get count(): number {
        return this._count;
    }

    private _count = 0;

    constructor(private http: HttpClient) {}

    public get(day: number): Observable<Story> {
        return this.http.get<Story>(`api/story/${day}`);
    }

    public getAuthors(): Observable<Story[]> {
        return this.http.get<Story[]>(`api/story/authors`);
    }

    public getOriginalLinks(): Observable<any> {
        return this.http.get<Story[]>(`api/story/original-links`);
    }

    public async setCount() {
        this._count = (await this.http.get<number>(`api/story/count`).toPromise()) ?? 0;
    }

    public getLatest(edition: string, amount: number = 5): Observable<Story[]> {
        const params = new HttpParams().set('edition', edition).set('amount', amount);
        return this.http.get<Story[]>(`api/story/latest`, { params });
    }

    public load(story: any): Story {
        return {
            ...story,
            prologues: story.prologues ?? [],
            paragraphs: story?.paragraphs?.map((x: string) => this.parseParagraph(x)) ?? [],
            summary: story?.summary?.map((x: string) => this.parseSummary(x))?.pop() ?? '',
        };
    }

    public parseParagraph(block: any): string {
        let paragraph = '';
        block.children.forEach((x: any) => {
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
    public parseSummary(block: any): string {
        return block.children[0].text;
    }

    private addEmphasis(text: string): string {
        return `<i>${text}</i>`;
    }

    private addStrong(text: string): string {
        return `<strong>${text}</strong>`;
    }
}