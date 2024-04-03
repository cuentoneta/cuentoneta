import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortableTextMarksSerializerComponent } from './portable-text-marks-serializer.component';

describe('PortableTextMarksSerializerComponent', () => {
	let component: PortableTextMarksSerializerComponent;
	let fixture: ComponentFixture<PortableTextMarksSerializerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PortableTextMarksSerializerComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(PortableTextMarksSerializerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
