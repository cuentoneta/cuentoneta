/**
 * Slugs de los documentos de origen de cada obra y colección migradas: son los que nombran las rutas
 * viejas. `$storyPrefix` y `$storylistPrefix` son los prefijos de procedencia (`MIGRATED_ID_PREFIX`).
 *
 * Se parte del documento migrado y no del de origen porque los tipos de origen ya no están en el schema y
 * el typegen tiparía vacío un filtro por ellos; además, así solo entran los orígenes que tienen a dónde
 * redirigir. Un origen ausente proyecta `null`.
 *
 * Los borradores no entran sin filtrarlos: el `_id` de uno empieza con `drafts.` y no con el prefijo.
 */
import { defineQuery } from 'groq';

export const legacySitemapSlugsQuery = defineQuery(`{
	"stories": *[_type == "literaryWork" && string::startsWith(_id, $storyPrefix)] | order(_id asc) { "legacySlug": *[_id == string::split(^._id, $storyPrefix)[1]][0].slug.current },
	"storylists": *[_type == "collection" && string::startsWith(_id, $storylistPrefix)] | order(_id asc) { "legacySlug": *[_id == string::split(^._id, $storylistPrefix)[1]][0].slug.current }
}`);
