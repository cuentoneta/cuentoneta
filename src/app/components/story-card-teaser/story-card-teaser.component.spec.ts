import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryCardTeaserComponent } from './story-card-teaser.component';

describe('StoryCardTeaserComponent', () => {
	let component: StoryCardTeaserComponent;
	let fixture: ComponentFixture<StoryCardTeaserComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StoryCardTeaserComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(StoryCardTeaserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
