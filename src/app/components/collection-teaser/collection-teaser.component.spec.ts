import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionTeaser } from './collection-teaser.component';

describe('StorylistCardComponent', () => {
	let component: CollectionTeaser;
	let fixture: ComponentFixture<CollectionTeaser>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CollectionTeaser],
		}).compileComponents();

		fixture = TestBed.createComponent(CollectionTeaser);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
