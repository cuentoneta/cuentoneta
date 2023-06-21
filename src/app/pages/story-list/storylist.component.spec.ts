import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorylistComponent } from './storylist.component';

describe('StoryListComponent', () => {
    let component: StorylistComponent;
    let fixture: ComponentFixture<StorylistComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StorylistComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StorylistComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
