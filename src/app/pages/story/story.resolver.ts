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
        const edition = route.paramMap.get('edition');
        // Si el parámetro "day" es nulo, se asigna el valor del count de historias, para obtener la última vigente
        const day = dayAsString ? parseInt(dayAsString, 10) : 0;
        return day && edition ? this.storyService.get(day, edition) : this.storyService.latest();
    }
}
