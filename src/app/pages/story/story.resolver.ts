import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { StoryModel } from '../../models/story.model';
import { Observable } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import {switchMap} from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class StoryResolver implements Resolve<StoryModel> {
    constructor(private storyService: StoryService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<StoryModel> {
        const dayAsString = route.paramMap.get('day');
        const edition = route.paramMap.get('edition') ?? 2022;

        // Asigna cantidad de cuentos de la edición correspondiente
        return this.storyService.getCount(edition).pipe(
          switchMap(count => {
            this.storyService.count = count;
            const day = dayAsString ? parseInt(dayAsString, 10) : 0;
            // Si el parámetro "day" es nulo, se obtiene la ultima historia desde el backend
            return day && edition ? this.storyService.get(day, edition) : this.storyService.latest();
          })
        )
    }
}
