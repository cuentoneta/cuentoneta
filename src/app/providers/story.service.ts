import { Injectable } from '@angular/core';
import { Story, StoryDTO } from '../models/story.model';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StoryService {
    get count(): number {
        return this._count;
    }

    private _count = 0;

    constructor(private http: HttpClient) {}

    //ToDo: ¿Es necesario este método ahora?
    public get(day: number): Observable<Story> {
        return this.http.get<Story>(`api/story/${day}`);
    }

    public getById(id: number|string): Observable<Story> {
        return this.http.get<Story>(`api/story/${id}`);
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
        return this.http
            .get<StoryDTO[]>(`api/story/latest`, { params })
            .pipe(map((stories) => stories.map((story) => this.parseCardContent(story))));
    }

    public parseCardContent(story: StoryDTO): Story {
        const result: Omit<Story, 'approximateReadingTime'> = {
            ...story,
            prologues: story.prologues ?? [],
            paragraphs: story?.paragraphs?.map((x: string) => this.parseParagraph(x)) ?? [],
            summary: story?.summary?.map((x: string) => this.parseSummary(x))?.pop() ?? '',
        };

        return { ...result, approximateReadingTime: this.calculateApproximateReadingTime(result) };
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

    private calculateApproximateReadingTime(story: Omit<Story, 'approximateReadingTime'>): number {
        const wordCount = story.paragraphs
            .map((paragraph) => paragraph.split(' ').length)
            .reduce((previous, current) => previous + current);
        return Math.ceil(wordCount / 200);
    }
}
