import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

describe('StoryEditionDateLabelComponent', () => {
    let component: StoryEditionDateLabelComponent;
    let fixture: ComponentFixture<StoryEditionDateLabelComponent>;

    @Component({
        imports: [StoryEditionDateLabelComponent],
        standalone: true
    })

    class StoryEditionDateLabelComponent { }

    beforeEach(async () => {
        fixture = TestBed.createComponent(StoryEditionDateLabelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
