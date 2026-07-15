import { Component, computed, input } from '@angular/core';

import { Epigraph } from '@models/story.model';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

/**
 * Variantes visuales del bloque de texto editorial (Design System v3):
 * - `note` (default): tarjeta neutra con borde (`neutral-50`/`neutral-150`), pensada como nota editorial
 *   al pie del cuerpo del cuento.
 * - `highlight`: callout con tinte de marca (`brand-50`) y barra de acento (`brand-400`); es la variante
 *   que reemplaza a la epígrafe en la página Story.
 */
export type EditorialTextBlockVariant = 'note' | 'highlight';

/**
 * Bloque de texto editorial (Design System v3). Renderiza contenido Portable Text (con intro en negrita
 * y enlaces resueltos por las marcas `strong`/`link`) con el estilo de la variante indicada.
 *
 * Reutiliza el tipo de dominio `Epigraph` como contenido. El pie de referencia se conserva alineado a la
 * derecha (en contraposición al diseño de Figma, que no lo muestra) para preservar el comportamiento de la
 * epígrafe que este componente reemplaza.
 */
@Component({
	selector: 'cuentoneta-editorial-text-block',
	imports: [PortableTextParserComponent],
	template: `
		@if (variant() === 'highlight') {
			<div class="w-1 self-stretch rounded-full bg-brand-400" data-testid="accent-bar"></div>
		}
		<div class="source-serif-lg flex flex-1 flex-col font-normal {{ textClasses() }}">
			<cuentoneta-portable-text-parser [paragraphs]="content().text" />
			@if (hasReference()) {
				<div class="text-end" data-testid="reference">
					<em><cuentoneta-portable-text-parser [paragraphs]="content().reference" /></em>
				</div>
			}
		</div>
	`,
	host: {
		'[class]': 'hostClasses()',
		'data-testid': 'editorial-text-block',
	},
})
export class EditorialTextBlockComponent {
	// Inputs
	public readonly content = input.required<Epigraph>();
	public readonly variant = input<EditorialTextBlockVariant>('note');

	// La query GROQ garantiza `reference: []` cuando no hay referencia (coalesce), así que el chequeo es por longitud.
	protected readonly hasReference = computed(() => this.content().reference.length > 0);

	// Chrome del contenedor y color de texto por variante. Colores/radios/espaciados salen de tokens del DS v3.
	private readonly variantClasses: Record<EditorialTextBlockVariant, { container: string; text: string }> = {
		note: { container: 'rounded-xl border border-neutral-150 bg-neutral-50 px-5 py-4', text: 'text-neutral-800' },
		highlight: { container: 'gap-4 rounded-lg bg-brand-50 p-2', text: 'text-neutral-700' },
	};

	protected readonly textClasses = computed(() => this.variantClasses[this.variant()].text);

	protected readonly hostClasses = computed(() => `flex items-center ${this.variantClasses[this.variant()].container}`);
}
