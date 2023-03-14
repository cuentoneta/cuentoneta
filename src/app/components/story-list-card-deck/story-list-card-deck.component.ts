import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryCardModule } from '../story-card/story-card.module';
import { RouterLink } from '@angular/router';
import { StoryList } from '../../models/storylist.model';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

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
    @Input() highlightFirstRow: boolean = false;
    @Input() displayTitle: boolean = true;
    @Input() displayDates: boolean = false;

    dummyList: null[] = [];

    ngOnInit() {
        this.dummyList = Array(this.number);
    }
}
