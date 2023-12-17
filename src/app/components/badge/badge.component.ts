import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'cuentoneta-badge',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `<span class="flex items-center gap-1"
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      data-id="28"
    >
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      ></polygon>
    </svg>
    {{ label }}
  </span> `,
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  @Input() label: string = '';
  @Input() tag: Tag | null = null;
  @Input() includeIcon: boolean = false;

  icon = '⭐';
}

interface Tag {
  label: string;
  iconUrl: string;
}
