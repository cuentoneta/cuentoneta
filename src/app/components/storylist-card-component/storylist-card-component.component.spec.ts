import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorylistCardComponentComponent } from './storylist-card-component.component';

describe('StorylistCardComponentComponent', () => {
  let component: StorylistCardComponentComponent;
  let fixture: ComponentFixture<StorylistCardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorylistCardComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StorylistCardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
