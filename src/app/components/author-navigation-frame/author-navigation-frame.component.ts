import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'cuentoneta-author-navigation-frame',
	standalone: true,
	imports: [CommonModule],
	template: `<p>author-navigation-frame works!</p>`,
	styles: ``,
})
export class AuthorNavigationFrameComponent {
	selectedStorySlug = input<string>();
}
