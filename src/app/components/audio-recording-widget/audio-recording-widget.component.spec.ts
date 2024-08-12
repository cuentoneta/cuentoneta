import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';

xdescribe('AudioRecordingWidgetComponent', () => {
	let component: AudioRecordingWidgetComponent;
	let fixture: ComponentFixture<AudioRecordingWidgetComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AudioRecordingWidgetComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(AudioRecordingWidgetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
