import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaResourceTagsComponent } from './media-resource-tags.component';

describe('MediaResourceTagsComponent', () => {
	let component: MediaResourceTagsComponent;
	let fixture: ComponentFixture<MediaResourceTagsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MediaResourceTagsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(MediaResourceTagsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
