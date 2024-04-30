import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorylistCardComponent } from './storylist-card.component';

describe('StorylistCardComponent', () => {
	let component: StorylistCardComponent;
	let fixture: ComponentFixture<StorylistCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StorylistCardComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(StorylistCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
