import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorylistCardDeckComponent } from './storylist-card-deck.component';

describe('StoryListCardDeckComponent', () => {
    let component: StorylistCardDeckComponent;
    let fixture: ComponentFixture<StorylistCardDeckComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StorylistCardDeckComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StorylistCardDeckComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
