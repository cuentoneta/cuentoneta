import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { switchMap } from 'rxjs';

@Component({
	selector: 'cuentoneta-author',
	standalone: true,
	imports: [CommonModule],
	template: `<p>author works!</p>`,
	styles: ``,
})
export class AuthorComponent {
	private activatedRoute = inject(ActivatedRoute);
	private storyService = inject(StoryService);

	stories$ = this.activatedRoute.params.pipe(switchMap(({ slug }) => this.storyService.getByAuthorSlug(slug)));

	constructor() {
		this.stories$.subscribe((stories) => console.log(stories));
	}
}
