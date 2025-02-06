import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonComponent } from './share-button.component';

describe('ShareButtonComponent', () => {
	let component: ShareButtonComponent;
	let fixture: ComponentFixture<ShareButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ShareButtonComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ShareButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
