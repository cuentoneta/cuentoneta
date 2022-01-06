import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { StoryModel } from '../../models/story.model';
import { Observable } from 'rxjs';
import { StoryService } from '../../providers/story.service';

@Injectable({ providedIn: 'root' })
export class StoryResolver implements Resolve<StoryModel> {
    constructor(private storyService: StoryService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<StoryModel> {
        const dayAsString = route.paramMap.get('day');
        const day = dayAsString ? parseInt(dayAsString, 10) : 0;
        return this.storyService.getStoryFromHttp(day);
    }
}
