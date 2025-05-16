import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorService } from '../../providers/author.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

@Component({
	imports: [CommonModule, RouterLink],
	hostDirectives: [MetaTagsDirective],
	template: `<main class="content horizontal-layout-spacing vertical-layout-spacing">
		<ul class="list-inside list-disc">
			@for (author of authors(); track author.slug) {
				<li>
					<span>
						<a [routerLink]="['/', 'author', author.slug]" class="underline">{{ author.name }}</a>
					</span>
				</li>
			}
		</ul>
	</main>`,
	styles: ``,
})
export default class AuthorsComponent {
	private authorService = inject(AuthorService);
	private metaTagsDirective = inject(MetaTagsDirective);

	private authorsResource = rxResource({
		loader: () => this.authorService.getAll(),
	});

	readonly authors = computed(() => this.authorsResource.value() ?? []);

	constructor() {
		this.metaTagsDirective.setTitle('Índice de Autores');
		this.metaTagsDirective.setDefaultDescription();
	}
}
