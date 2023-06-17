import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

describe('StoryNavigationBarComponent', () => {
    let component: StoryNavigationBarComponent;
    let fixture: ComponentFixture<StoryNavigationBarComponent>;

    @Component({
        imports: [StoryNavigationBarComponent],
        standalone: true
    })

    class StoryNavigationBarComponent { }

    beforeEach(async () => {
        fixture = TestBed.createComponent(StoryNavigationBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
