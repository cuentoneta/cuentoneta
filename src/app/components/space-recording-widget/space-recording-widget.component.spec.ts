import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';

describe('SpaceRecordingWidgetComponent', () => {
	let component: SpaceRecordingWidgetComponent;
	let fixture: ComponentFixture<SpaceRecordingWidgetComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SpaceRecordingWidgetComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SpaceRecordingWidgetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
