import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryListCardDeckComponent } from './story-list-card-deck.component';

describe('StoryListCardDeckComponent', () => {
    let component: StoryListCardDeckComponent;
    let fixture: ComponentFixture<StoryListCardDeckComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StoryListCardDeckComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StoryListCardDeckComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
