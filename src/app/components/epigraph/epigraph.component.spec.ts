import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpigraphComponent } from './epigraph.component';

describe('StoryEpilogueComponent', () => {
	let component: EpigraphComponent;
	let fixture: ComponentFixture<EpigraphComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [EpigraphComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(EpigraphComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
