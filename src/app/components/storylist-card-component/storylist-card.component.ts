import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cuentoneta-storylist-card',
  standalone: true,
  imports: [CommonModule],
  template: `<p>storylist-card-component works!</p>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistCardComponent{}
