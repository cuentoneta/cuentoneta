import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryComponent } from './story.component';
import { Component } from '@angular/core';

describe('StoryComponent', () => {
    let component: StoryComponent;
    let fixture: ComponentFixture<StoryComponent>;

    @Component({
        imports: [StoryComponent],
        standalone: true
    })

    class StoryComponent { }

    beforeEach(async () => {
        fixture = TestBed.createComponent(StoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
