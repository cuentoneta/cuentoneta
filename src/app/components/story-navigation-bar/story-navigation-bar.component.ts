import { Component, Input } from '@angular/core';
import { Publication, Storylist } from '../../models/storylist.model';
import { Story } from '../../models/story.model';
import { APP_ROUTE_TREE } from '../../app-routing.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, CommonModule } from '@angular/common';

@Component({
    selector: 'cuentoneta-story-navigation-bar',
    templateUrl: './story-navigation-bar.component.html',
    styleUrls: ['./story-navigation-bar.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgxSkeletonLoaderModule,
        NgIf,
        NgFor,
        RouterLink,
        StoryEditionDateLabelComponent,
        StoryNavigationBarComponent
    ],
})
export class StoryNavigationBarComponent {
    @Input() storylist!: Storylist;

    readonly appRouteTree = APP_ROUTE_TREE;
    dummyList: null[] = Array(10);

    // ToDo: Separar card de cada cuento de la lista en su propio componente, para evitar usar un método en el template
    getEditionLabel(publication: Publication<Story>, editionIndex: number = 0): string {
        return `${this.storylist?.editionPrefix} ${editionIndex} ${this.storylist.displayDates ? ' - ' + publication.publishingDate : ''
            }`;
    }
}
