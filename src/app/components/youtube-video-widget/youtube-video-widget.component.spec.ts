import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';

describe('YoutubeVideoWidgetComponent', () => {
	let component: YoutubeVideoWidgetComponent;
	let fixture: ComponentFixture<YoutubeVideoWidgetComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [YoutubeVideoWidgetComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(YoutubeVideoWidgetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
