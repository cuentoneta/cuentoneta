import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioSummaryCardComponent } from './bio-summary-card.component';

describe('BioSummaryCardComponent', () => {
    let component: BioSummaryCardComponent;
    let fixture: ComponentFixture<BioSummaryCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BioSummaryCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BioSummaryCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
