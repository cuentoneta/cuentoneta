import { Injectable } from '@angular/core';
import { StoryModel } from '../models/story.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StoryService {
    get count(): number {
        return this._count;
    }

    private _count = 0;

    constructor(private http: HttpClient) {}

    public get(day: number): Observable<StoryModel> {
        return this.http.get<StoryModel>(`api/story/${day}`);
    }

    public getAuthors(): Observable<StoryModel[]> {
        return this.http.get<StoryModel[]>(`api/story/authors`);
    }

    public getOriginalLinks(): Observable<any> {
        return this.http.get<StoryModel[]>(`api/story/original-links`);
    }

    public async setCount() {
        this._count = (await this.http.get<number>(`api/story/count`).toPromise()) ?? 0;
    }

    public load(story: any): StoryModel {
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