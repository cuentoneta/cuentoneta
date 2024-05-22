import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryCardContentComponent } from './story-card-content.component';

describe('StoryCardContentComponent', () => {
	let component: StoryCardContentComponent;
	let fixture: ComponentFixture<StoryCardContentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StoryCardContentComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(StoryCardContentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
