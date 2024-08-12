import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorNavigationFrameComponent } from './author-navigation-frame.component';

xdescribe('AuthorNavigationFrameComponent', () => {
	let component: AuthorNavigationFrameComponent;
	let fixture: ComponentFixture<AuthorNavigationFrameComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AuthorNavigationFrameComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(AuthorNavigationFrameComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
