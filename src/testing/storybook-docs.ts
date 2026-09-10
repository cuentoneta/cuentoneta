/**
 * Referencias cruzadas de la prosa de autodocs, resueltas por el compilador en vez de por un checker.
 *
 * La descripción de una story nombra y enlaza a otras entradas del catálogo. Escritas a mano, esas dos
 * mitades se desincronizan sin emitir señal: `storybook:build` compila la prosa pero no la ejecuta, así
 * que un componente borrado sigue nombrado y un `kind-id` mal tipeado sigue enlazado. Acá el nombre
 * visible y el `kind-id` salen los dos del **mismo** `title`, que vive en el módulo `*.docs.ts` del
 * directorio de la entrada referida. Borrar una entrada borra su módulo, y entonces cada referente
 * deja de compilar: el fallo se adelanta de la prosa publicada al `typecheck`.
 *
 * El módulo `*.docs.ts` existe para romper el ciclo. Trece pares de stories se referencian mutuamente,
 * así que importar el `meta` de la otra produciría un ciclo ESM y el `const` caería en zona muerta
 * temporal al evaluar el template literal de la prosa. Un módulo que no importa nada no puede formar
 * un ciclo, y por eso el `title` vive ahí y no en el `meta`, que lo consume.
 *
 * El nombre visible es el último segmento del `title`, no el de la clase: el catálogo publica
 * `AudioRecording` para `AudioRecordingWidgetComponent`, y es el título el que decide qué lee quien
 * navega los autodocs.
 */

/** La entrada de catálogo de una story: su `title` de Storybook, declarado una sola vez. */
export interface StoryDocsEntry {
	readonly title: string;
}

/**
 * La normalización que Storybook aplica a un `title` para resolver un `kind-id`.
 *
 * Copia de su `sanitize`: baja a minúsculas y sustituye espacios, `/` y puntuación por guiones,
 * colapsando y recortando. No transcribe diacríticos, así que una sección acentuada los conserva
 * (`Páginas/CollectionsPage` resuelve a `páginas-collectionspage`).
 */
export function kindId(title: string): string {
	return title
		.toLowerCase()
		.replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

/** El nombre con el que el catálogo publica una entrada: el último segmento de su `title`. */
export function docsName(entry: StoryDocsEntry): string {
	return entry.title.slice(entry.title.lastIndexOf('/') + 1);
}

/** El nombre de una entrada, resaltado, sin enlazar. Para nombrarla sin invitar a navegar hacia ella. */
export function docsMention(entry: StoryDocsEntry): string {
	return `<strong>${docsName(entry)}</strong>`;
}

/**
 * El nombre de una entrada, resaltado y enlazado a su página de autodocs.
 *
 * `target="_top"` porque la prosa se renderiza dentro del iframe del canvas: sin él, la navegación
 * abriría el catálogo anidado adentro de sí mismo.
 */
export function docsRef(entry: StoryDocsEntry): string {
	return docsLink(entry, docsName(entry));
}

/**
 * El enlace a una entrada bajo un texto propio, para cuando la prosa la nombra en castellano
 * ("las sugerencias de lectura") en vez de por su nombre de catálogo.
 */
export function docsLink(entry: StoryDocsEntry, label: string): string {
	return `<a href="./?path=/docs/${kindId(entry.title)}--docs" target="_top"><strong>${label}</strong></a>`;
}
