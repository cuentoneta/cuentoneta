import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigablePublicationTeaserComponent } from './navigable-publication-teaser.component';

describe('NavigablePublicationTeaserComponent', () => {
	let component: NavigablePublicationTeaserComponent;
	let fixture: ComponentFixture<NavigablePublicationTeaserComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NavigablePublicationTeaserComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(NavigablePublicationTeaserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
