import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('BioSummaryCardComponent', () => {
    let component: BioSummaryCardComponent;
    let fixture: ComponentFixture<BioSummaryCardComponent>;

    @Component({
        imports: [BioSummaryCardComponent],
        standalone: true
    })

    class BioSummaryCardComponent { }

    beforeEach(async () => {
        fixture = TestBed.createComponent(BioSummaryCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
