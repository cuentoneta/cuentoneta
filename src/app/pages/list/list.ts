import { Component, OnInit } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { StoryModel } from '../../models/story.model';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html',
    styleUrls: ['./list.scss'],
})
export class ListPage implements OnInit {
    public isLoading: boolean = false;
    public storyList$: Observable<StoryModel[]> = of();

    constructor(private route: ActivatedRoute, private router: Router, private storyService: StoryService) {}

    ngOnInit() {
        this.storyList$ = this.route.params.pipe(
            tap(() => {
                this.isLoading = true;
            }),
            switchMap(({ edition }) => this.storyService.getAuthors(edition)),
            tap(() => {
                this.isLoading = false;
            })
        );
    }

    public navigateToStory(day: number) {
        const edition = this.route.snapshot.paramMap.get('edition');
        this.router.navigate([`/story/${day}/${edition}`]);
    }
}
