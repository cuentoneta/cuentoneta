import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaResourceComponent } from './media-resource.component';

describe('MediaResourceComponent', () => {
	let component: MediaResourceComponent;
	let fixture: ComponentFixture<MediaResourceComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MediaResourceComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(MediaResourceComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
