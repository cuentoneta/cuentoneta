import {
  Component,
  inject,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Tag } from '@models/tag.model';
import { BypassHtmlSanitizerPipe } from '../../pipes/bypass-html-sanitizer.pipe';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'cuentoneta-badge',
  standalone: true,
  hostDirectives: [TooltipDirective],
  imports: [BypassHtmlSanitizerPipe, CommonModule, NgOptimizedImage],
  template: `<span class="flex items-center gap-1">
    @if (showIcon && !!tag.icon?.svg) {
    <div [outerHTML]="tag.icon?.svg ?? '' | bypassHtmlSanitizer"></div>
    }
    {{ tag.title }}
  </span> `,
  styleUrls: ['./badge.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BadgeComponent implements OnInit {
  @Input({ required: true }) tag!: Tag;
  @Input() showIcon: boolean = false;

  private tooltipDirective = inject(TooltipDirective);

  ngOnInit() {
    this.tooltipDirective.text = this.tag.description;
    this.tooltipDirective.position = 'top';
  }
}
