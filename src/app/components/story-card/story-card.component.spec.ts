import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

describe('StoryCardComponent', () => {
    let component: StoryCardComponent;
    let fixture: ComponentFixture<StoryCardComponent>;

    @Component({
        imports: [StoryCardComponent],
        standalone: true
    })

    class StoryCardComponent { }

    beforeEach(async () => {
        fixture = TestBed.createComponent(StoryCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
