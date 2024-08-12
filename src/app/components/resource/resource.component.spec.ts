import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceComponent } from './resource.component';

xdescribe('ResourceComponent', () => {
	let component: ResourceComponent;
	let fixture: ComponentFixture<ResourceComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ResourceComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ResourceComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
