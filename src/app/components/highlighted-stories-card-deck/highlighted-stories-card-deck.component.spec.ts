import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightedStoriesCardDeckComponent } from './highlighted-stories-card-deck.component';

describe('HighlightedStoriesCardDeckComponent', () => {
	let component: HighlightedStoriesCardDeckComponent;
	let fixture: ComponentFixture<HighlightedStoriesCardDeckComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HighlightedStoriesCardDeckComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(HighlightedStoriesCardDeckComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
