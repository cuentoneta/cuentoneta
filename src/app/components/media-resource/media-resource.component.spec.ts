import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaResourceComponent } from './media-resource.component';
import { MediaTypes } from '@models/media.model';

const inputMock: MediaTypes[] = [];

describe('MediaResourceComponent', () => {
	let component: MediaResourceComponent;
	let fixture: ComponentFixture<MediaResourceComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MediaResourceComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(MediaResourceComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('mediaResources', inputMock);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
