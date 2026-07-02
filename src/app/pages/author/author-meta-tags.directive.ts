import { Directive, effect, inject, untracked } from '@angular/core';

import { AppRoutes } from '../../app.routes';
import { buildCanonicalUrl } from '../../utils/build-canonical-url.util';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { AbstractMetaTagsDirective } from '../../directives/abstract-meta-tags.directive';
import { AUTHOR_HOST } from './author-host';

@Directive({
	selector: '[cuentonetaAuthorMetaTags]',
	hostDirectives: [HeadMetadataDirective],
})
export class AuthorMetaTagsDirective extends AbstractMetaTagsDirective {
	private readonly host = inject(AUTHOR_HOST);

	// El canonical/og:url se deriva solo del slug (disponible sync desde el primer render), desacoplado
	// del gate en la entidad, para que la página nunca quede sin canonical aunque el fetch no haya resuelto.
	private readonly syncCanonicalEffect = effect(() => {
		this.head.setCanonicalUrl(buildCanonicalUrl(`${AppRoutes.Author}/${this.host.slug()}`));
	});

	protected applyMetaTags(): void {
		const author = this.host.author();
		if (!author) {
			return;
		}
		untracked(() => {
			this.head.setTitle(author.name);
			this.head.setDescription(`Perfil y obras de ${author.name} para leer en La Cuentoneta.`);
			this.head.setRobots('index, follow');
			this.head.setKeywords(['escritor', 'poemas', 'cuentos', 'autor', author.name.toLowerCase()]);
		});
	}
}
