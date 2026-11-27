import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppRoutes } from '../../app.routes';
import { ImageProfile } from '../image-profile/image-profile';

/** Campos que el bloque necesita de un autor; satisfechos por `Author` y `AuthorTeaser` por igual. */
export interface AuthorsBylineAuthor {
	readonly slug: string;
	readonly name: string;
	readonly imageUrl: string;
}

/** Tema visual del nombre (Design System v3): `on-light` para fondos claros, `on-dark` para el hero. */
export type AuthorsBylineTheme = 'on-light' | 'on-dark';

type AuthorsBylinePart = { kind: 'author'; name: string; slug: string } | { kind: 'separator'; text: string };

// Localiza la unión de nombres ("A y B", "A, B y C") con la gramática del idioma en vez de un join
// manual con coma/"y" fijos, que no generaliza a 3+ autores ni resuelve la "y"/"e" delante de vocal.
const authorsListFormatter = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' });

/**
 * Bloque de autor(es) de una obra (Design System v3): avatar del primer autor + nombre(s), cada uno
 * con su propio enlace accesible a `/author/:slug`, unidos con la conjunción del idioma.
 *
 * Reutilizado por el hero, la card-teaser y la home-card-teaser de una obra, que antes repetían el
 * mismo markup limitado a `authors[0]`. El avatar muestra solo al primer autor: con N autores no hay
 * una foto "representativa" del grupo, así que no se apilan ni se elige otra.
 */
@Component({
	selector: 'cuentoneta-authors-byline',
	imports: [RouterLink, ImageProfile],
	template: `
		<cuentoneta-image-profile [src]="authors()[0].imageUrl" size="small" class="shrink-0" />
		<span [class]="nameClasses()">
			@for (part of parts(); track $index) {
				@if (part.kind === 'author') {
					<a [routerLink]="['/', appRoutes.Author, part.slug]" class="hover:underline">{{ part.name }}</a>
				} @else {
					<ng-container>{{ part.text }}</ng-container>
				}
			}
		</span>
	`,
	host: { class: 'flex min-w-0 items-center gap-2', 'data-testid': 'author' },
})
export class AuthorsByline {
	private readonly appRoutes = AppRoutes;

	// Al menos un autor: invariante que ya hacen cumplir `createLiteraryWork`/`createLiteraryWorkNavigationTeaser`.
	public readonly authors = input.required<readonly AuthorsBylineAuthor[]>();
	public readonly theme = input<AuthorsBylineTheme>('on-light');

	private readonly nameClassesByTheme: Record<AuthorsBylineTheme, string> = {
		'on-light': 'truncate font-inter text-sm font-medium text-neutral-900',
		'on-dark': 'font-inter text-sm font-medium text-neutral-50',
	};

	private readonly nameClasses = computed(() => this.nameClassesByTheme[this.theme()]);

	// `formatToParts` conserva el orden de entrada para los elementos, así que un contador propio
	// (y no el nombre) ata cada parte "autor" de vuelta a su autor, incluso si dos comparten nombre.
	private readonly parts = computed<AuthorsBylinePart[]>(() => {
		const authors = this.authors();
		let authorIndex = 0;
		return authorsListFormatter.formatToParts(authors.map((author) => author.name)).map((part) => {
			if (part.type === 'literal') {
				return { kind: 'separator', text: part.value };
			}
			const author = authors[authorIndex];
			authorIndex += 1;
			return { kind: 'author', name: author.name, slug: author.slug };
		});
	});
}
