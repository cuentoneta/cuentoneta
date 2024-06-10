import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorylistNavigationFrameComponent } from './storylist-navigation-frame.component';

describe('StorylistNavigationFrameComponent', () => {
	let component: StorylistNavigationFrameComponent;
	let fixture: ComponentFixture<StorylistNavigationFrameComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StorylistNavigationFrameComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(StorylistNavigationFrameComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
