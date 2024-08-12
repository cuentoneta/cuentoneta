import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

xdescribe('BadgeComponent', () => {
	let component: BadgeComponent;
	let fixture: ComponentFixture<BadgeComponent>;

	// beforeEach(async () => {
	// 	await TestBed.configureTestingModule({
	// 		imports: [BadgeComponent],
	// 	}).compileComponents();
	//
	// 	fixture = TestBed.createComponent(BadgeComponent);
	// 	component = fixture.componentInstance;
	// 	component.tag = {
	// 		title: 'test',
	// 		description: 'test',
	// 		icon: { svg: 'test.svg', provider: 'md', name: 'test' },
	// 		slug: 'test',
	// 	};
	// 	component.showIcon = true;
	// 	fixture.detectChanges();
	// });

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
