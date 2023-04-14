import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryCardSkeletonComponent } from './story-card-skeleton.component';

describe('StoryCardSkeletonComponent', () => {
  let component: StoryCardSkeletonComponent;
  let fixture: ComponentFixture<StoryCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryCardSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StoryCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
