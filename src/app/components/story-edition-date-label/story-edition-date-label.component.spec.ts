import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryEditionDateLabelComponent } from './story-edition-date-label.component';

describe('StoryEditionDateLabelComponent', () => {
    let component: StoryEditionDateLabelComponent;
    let fixture: ComponentFixture<StoryEditionDateLabelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StoryEditionDateLabelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StoryEditionDateLabelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
