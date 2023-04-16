import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareContentComponent } from './share-content.component';

describe('ShareContentComponent', () => {
  let component: ShareContentComponent;
  let fixture: ComponentFixture<ShareContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
