import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigableStoryTeaserComponent } from './navigable-story-teaser.component';

xdescribe('NavigableStoryTeaserComponent', () => {
	let component: NavigableStoryTeaserComponent;
	let fixture: ComponentFixture<NavigableStoryTeaserComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NavigableStoryTeaserComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(NavigableStoryTeaserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
