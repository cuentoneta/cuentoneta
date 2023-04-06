// Core
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

// Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';
import { StoryCardModule } from '../story-card/story-card.module';

// Models
import { StoryList } from '../../models/storylist.model';



@Component({
    selector: 'cuentoneta-story-list-card-deck',
    standalone: true,
    imports: [CommonModule, StoryCardModule, RouterLink, NgxSkeletonLoaderModule],
    templateUrl: './story-list-card-deck.component.html',
    styleUrls: ['./story-list-card-deck.component.scss'],
})
export class StoryListCardDeckComponent implements OnInit {
    @Input() number: number = 6;
    @Input() storylist: StoryList | undefined;
    @Input() isLoading: boolean = false; // Utilizado para mostrar/ocultar skeletons
    @Input() highlightFirstRow: boolean = false;
    @Input() displayTitle: boolean = true;

    dummyList: null[] = [];

    ngOnInit() {
        this.dummyList = Array(this.number);
    }
}
