import { Component, Input } from '@angular/core';
import { fireEvent, getByText, render, screen, waitFor } from '@testing-library/angular'
import { TooltipDirective } from './tooltip.directive';

const ELEMENT_WIDTH = 500;
const ELEMENT_HEIGHT = 500;
@Component({
  template: `
    <div 
      [style.width.px]="width" 
      [style.height.px]="height"
      tooltip
      text="Tooltip test"
      [position]="position"
    >
      Host component
    </div>
  `,
  standalone: true
})
class HostComponent {
  width = ELEMENT_WIDTH;
  height = ELEMENT_HEIGHT;
  @Input() position: string = 'top';
}

describe('TooltipDirective', () => {
  
  test('Should render a tooltip when the mouse enter the Host component', async () => {
    await render(HostComponent, {
      componentProperties: { position: "top" },
      componentImports: [TooltipDirective]
    });
    const hostComponent = screen.getByText(/Host component/);
    fireEvent.mouseEnter(hostComponent);


    // await waitFor(() => {
      expect(screen.getByText('Tooltip test')).toBeTruthy();
    // });

    fireEvent.mouseLeave(hostComponent);
    expect(screen.queryByText('Tooltip test')).not.toBeTruthy();

  });
});
