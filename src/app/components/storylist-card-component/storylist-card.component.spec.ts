import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorylistCardComponent } from './storylist-card.component';
import { MockA11yTooltipModule } from '@mocks/external-libs/a11y-tooltip-module.mock';

describe('StorylistCardComponent', () => {
	let component: StorylistCardComponent;
	let fixture: ComponentFixture<StorylistCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({})
			.overrideComponent(StorylistCardComponent, {
				set: {
					imports: [MockA11yTooltipModule],
				},
			})
			.compileComponents();

		fixture = TestBed.createComponent(StorylistCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
