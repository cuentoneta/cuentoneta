import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortableTextParserComponent } from './portable-text-parser.component';

describe('PortableTextParserComponent', () => {
	let component: PortableTextParserComponent;
	let fixture: ComponentFixture<PortableTextParserComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PortableTextParserComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(PortableTextParserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
