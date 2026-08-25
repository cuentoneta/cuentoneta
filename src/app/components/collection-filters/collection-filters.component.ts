import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidChevronDown, faSolidXmark } from '@ng-icons/font-awesome/solid';

import type { CollectionTeaser } from '@models/collection.model';
import type { Tag } from '@models/tag.model';

interface CollectionFacet {
	readonly tag: Tag;
	readonly count: number;
	readonly selected: boolean;
}

@Component({
	selector: 'cuentoneta-collection-filters',
	providers: [provideIcons({ faSolidCheck, faSolidChevronDown, faSolidXmark })],
	imports: [NgIcon],
	host: { class: 'flex flex-col gap-6' },
	template: `
		<div class="flex items-center justify-between">
			<h2 class="font-inter text-base leading-6 font-bold text-neutral-900">Filtros</h2>
			@if (selectedTags().length > 0) {
				<button
					(click)="cleared.emit()"
					type="button"
					class="cursor-pointer font-inter text-xs leading-4 font-semibold text-neutral-900 underline hover:text-brand-500"
				>
					Limpiar filtros
				</button>
			}
		</div>

		@if (selectedTags().length > 0) {
			<ul class="flex list-none flex-wrap gap-2" data-testid="active-filters">
				@for (tag of selectedTags(); track tag.slug) {
					<li>
						<button
							(click)="toggled.emit(tag)"
							[attr.aria-label]="'Quitar el filtro ' + tag.title"
							type="button"
							class="flex cursor-pointer items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1.5 font-inter text-[10px] leading-[14px] font-semibold text-brand-500"
						>
							{{ tag.title }}
							<ng-icon name="faSolidXmark" size="14" aria-hidden="true" />
						</button>
					</li>
				}
			</ul>
		}

		<!-- El nombre va por \`aria-label\` y no por el \`legend\`: un legend que contiene un botón deja al
		     \`fieldset\` sin nombre. Por eso el rótulo se repite, y las dos copias salen del mismo campo.
		     La separación con la lista tampoco puede venir de \`gap\` —el legend no es flex item—, así que la
		     lleva la lista y se va con ella al plegar. -->
		<fieldset [attr.aria-label]="categoryLabel" class="min-w-0">
			<legend>
				<button
					(click)="toggleCategoryGroup()"
					[attr.aria-expanded]="isCategoryGroupOpen()"
					aria-controls="category-facets"
					type="button"
					class="flex cursor-pointer items-center gap-1 font-inter text-sm leading-5 font-semibold text-neutral-900"
				>
					{{ categoryLabel }}
					<!-- El diseño dibuja el trazo chico y centrado dentro de una caja de 24, no llenándola. El
					     \`aria-hidden\` va acá y no solo en el icono: adentro del botón, el icono le borra el nombre. -->
					<span aria-hidden="true" class="flex size-6 items-center justify-center">
						<ng-icon
							[class.-rotate-90]="!isCategoryGroupOpen()"
							name="faSolidChevronDown"
							size="12"
							class="transition-transform"
						/>
					</span>
				</button>
			</legend>
			@if (isCategoryGroupOpen()) {
				<ul class="mt-3 flex list-none flex-col gap-2.5" id="category-facets">
					@for (facet of facets(); track facet.tag.slug) {
						<li class="flex items-center gap-1.5">
							<span class="relative flex size-5 shrink-0 items-center justify-center">
								<input
									(change)="toggled.emit(facet.tag)"
									[checked]="facet.selected"
									[id]="'facet-' + facet.tag.slug"
									class="peer size-5 cursor-pointer appearance-none rounded border-2 border-neutral-300 bg-white checked:border-brand-500 checked:bg-brand-500"
									type="checkbox"
								/>
								<!-- Aparte y no como \`::after\`: en un elemento reemplazado no se renderiza. El color va por
								     estilo porque la utilidad no resuelve sobre el host del icono. -->
								<ng-icon
									[style.color]="'var(--color-white)'"
									name="faSolidCheck"
									size="12"
									aria-hidden="true"
									class="pointer-events-none absolute hidden peer-checked:block"
								/>
							</span>
							<label
								[for]="'facet-' + facet.tag.slug"
								class="cursor-pointer font-inter text-xs leading-4 font-medium text-neutral-900"
							>
								{{ facet.tag.title }} ({{ facet.count }})
							</label>
						</li>
					}
				</ul>
			}
		</fieldset>
	`,
})
export class CollectionFiltersComponent {
	/** Las colecciones sobre las que se cuentan las facetas: las que están a la vista, no el catálogo. */
	public readonly collections = input.required<readonly CollectionTeaser[]>();
	public readonly selected = input.required<readonly string[]>();

	public readonly toggled = output<Tag>();
	public readonly cleared = output<void>();

	protected readonly categoryLabel = 'Categoría';

	private readonly collator = new Intl.Collator('es');

	protected readonly facets = computed<readonly CollectionFacet[]>(() => {
		const selected = new Set(this.selected());
		const counts = new Map<string, CollectionFacet>();
		for (const collection of this.collections()) {
			for (const tag of collection.tags) {
				const seen = counts.get(tag.slug);
				counts.set(tag.slug, { tag, count: (seen?.count ?? 0) + 1, selected: selected.has(tag.slug) });
			}
		}
		return [...counts.values()].sort((first, second) => this.collator.compare(first.tag.title, second.tag.title));
	});

	protected readonly selectedTags = computed(() =>
		this.facets()
			.filter((facet) => facet.selected)
			.map((facet) => facet.tag),
	);

	private readonly categoryGroupOpen = signal(true);
	protected readonly isCategoryGroupOpen = this.categoryGroupOpen.asReadonly();

	protected toggleCategoryGroup(): void {
		this.categoryGroupOpen.update((open) => !open);
	}
}
