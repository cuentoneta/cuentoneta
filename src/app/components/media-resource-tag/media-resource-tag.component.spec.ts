import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaResourceTagComponent } from './media-resource-tag.component';

describe('MediaResourceTagComponent', () => {
	let component: MediaResourceTagComponent;
	let fixture: ComponentFixture<MediaResourceTagComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MediaResourceTagComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(MediaResourceTagComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
