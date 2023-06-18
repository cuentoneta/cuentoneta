import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryCardComponent } from './story-card.component';

describe('StoryCardComponent', () => {
    let component: StoryCardComponent;
    let fixture: ComponentFixture<StoryCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StoryCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StoryCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
