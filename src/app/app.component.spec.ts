import { AppComponent } from './app.component';
import { render, screen } from '@testing-library/angular';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(async () => {
    component = await render(AppComponent);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
