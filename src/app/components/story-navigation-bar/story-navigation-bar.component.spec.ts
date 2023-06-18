import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryNavigationBarComponent } from './story-navigation-bar.component';

describe('StoryNavigationBarComponent', () => {
    let component: StoryNavigationBarComponent;
    let fixture: ComponentFixture<StoryNavigationBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StoryNavigationBarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StoryNavigationBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
