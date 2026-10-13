# Rutas viejas: redirecciones y sitemap temporal

Las URLs indexadas de la plataforma anterior (`/story`, `/storylist`) responden con un 301 a las rutas vigentes (`/literary-work`, `/collection`). Este documento describe cómo se resuelve el destino de cada una y el sitemap temporal que le pide al buscador que las vuelva a rastrear.

| Parte                 | Alcance                  | Código                                                                                      |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| Redirecciones (301)   | **Permanente**           | `src/api/_middleware/legacy-route-redirects.middleware.ts`, `src/api/modules/legacy-route/` |
| `/sitemap-legacy.xml` | **Temporal** (se retira) | `src/api/modules/sitemap/sitemap-legacy.*`, `src/api/_queries/sitemap-legacy.query.ts`      |

---

## 1. Redirecciones permanentes

### Rutas

| Ruta vieja         | Destino                             | Resolución                  |
| ------------------ | ----------------------------------- | --------------------------- |
| `/story`           | `/literary-work`                    | Literal                     |
| `/storylist`       | `/collection`                       | Literal                     |
| `/story/:slug`     | `/literary-work/<slug del migrado>` | Por procedencia (ver abajo) |
| `/storylist/:slug` | `/collection/<slug del migrado>`    | Por procedencia (ver abajo) |

Los handlers son terminales (responden en vez de ceder a `next()`) y se montan en `src/server.ts` antes de los estáticos y del catch-all SSR. El 301 viaja en la respuesta HTTP y no en el router del cliente: un crawler que no ejecuta JavaScript solo ve el 301, y es el 301 lo que traslada lo que la ruta vieja tenga indexado. La query string se preserva, porque es donde viajan los parámetros de campaña.

### Resolución por procedencia

El destino de una ruta de detalle **no es el slug tal cual**: la migración no siempre conservó el slug del origen. Una cadena de renombres puede dejar el slug viejo de una obra como slug vigente de otra, y un slug con mayúsculas ya no lo construye el dominio. Copiar el slug mandaría esas rutas a otra obra o a un 404.

La única huella de la procedencia en el dataset es el `_id` del documento migrado:

| Tipo      | `_id` del migrado                                 |
| --------- | ------------------------------------------------- |
| Obra      | `lw-from-story-<_id de la story>`                 |
| Colección | `collection-from-storylist-<_id de la storylist>` |

Los prefijos viven en `MIGRATED_ID_PREFIX` (`legacy-route.constants.ts`). Dado el slug de la ruta vieja, la query:

1. Busca el documento de origen por `slug.current`, ignorando borradores y **sin filtrar por `_type`**.
2. Arma `<prefijo> + _id del origen` y devuelve el `slug.current` del documento migrado con ese `_id`.
3. Si dos orígenes comparten slug, elige el de menor `_id` (`order(_id asc)`), para que el resultado sea determinista.

El filtro por `_type` se omite a propósito: `story` y `storylist` ya no están en el schema del Studio, y el typegen tiparía ese filtro como vacío (`never`). No hace falta, porque anteponer el prefijo al `_id` de cualquier otro documento con el mismo slug —incluido el propio migrado— no nombra ningún documento.

```ts
import { resolveLegacySlug } from '../modules/legacy-route/legacy-route.service';

// Cadena de renombres: devuelve el slug del migrado, no el homónimo.
const slug = await resolveLegacySlug('story', 'pez-platano');
```

### Fallback sin origen

Si ningún documento migrado proviene de un origen con ese slug, `resolveLegacySlug` devuelve el slug pedido (passthrough). Es el comportamiento previo, y acierta para toda ruta que nombra un slug que la migración conservó.

### Caché de borde

El 301 resuelto pasa por `applyReadCacheHeaders` (política única, ver [`LITERARY_WORK_DESIGN.md` §8](LITERARY_WORK_DESIGN.md#8-estrategia-de-caché-de-borde)), de modo que el rastreo de las rutas viejas lo absorbe el CDN y no consulta a Sanity en cada visita. Como el resto de la política, **solo se emite en producción**.

### Degradación ante un error de Sanity

El service deja propagar el error; degradar es decisión del handler. Si la consulta falla, el handler:

- traslada al slug pedido tal cual (passthrough),
- **no** aplica headers de caché, para que el pedido siguiente vuelva a intentar resolver en vez de heredar un destino que puede estar mal,
- registra el error con `console.error` (sección, slug pedido y causa).

Se descartó responder 503: convertiría una caída de Sanity en errores visibles para todas las URLs viejas, cuando el passthrough acierta para casi todas.

### Slug codificado

El router entrega el slug decodificado, así que el handler lo vuelve a codificar (`encodeURIComponent`) antes de componer el `Location`. Sin eso, un slug con un carácter reservado produciría un destino distinto del pedido y, en el peor caso, con otro host.

---

## 2. Sitemap temporal

`GET /sitemap-legacy.xml` lista las URLs viejas de las obras y colecciones migradas para que el buscador las vuelva a pedir, vea el 301 y consolide cada una en su URL nueva. Se declara como segundo `Sitemap:` en `public/robots.txt`. El sitemap principal (`/sitemap.xml`) **no cambia** y no importa nada de `sitemap-legacy.*`: la dependencia va al revés, el temporal reutiliza las primitivas del principal, para que el retiro sea un borrado.

### Contenido

- `<BASE_URL>/story/<slug de origen>` por cada obra migrada y `<BASE_URL>/storylist/<slug de origen>` por cada colección migrada. El host sale de `BASE_URL`, igual que en el sitemap principal.
- Se parte del documento **migrado** y se llega al origen por `_id`: así solo entran los orígenes que tienen a dónde redirigir. Un migrado cuyo origen falta se descarta con `console.warn`.
- El slug se codifica con `encodeURIComponent` antes del escape XML.
- Dos orígenes con el mismo slug producen la misma `loc`: se conserva una y se advierte con `console.warn` (misma política que el sitemap principal).
- Respuesta `application/xml` con `Cache-Control: public, max-age=21600` (6 horas) y `nosniff`; ante un error responde 500 y lo registra.

### Por qué no lleva `lastmod`

La fecha del documento migrado no dice nada de la URL vieja: la ruta vieja ya no tiene contenido, solo un 301. Un `lastmod` engañaría al buscador sobre cuándo cambió lo que va a rastrear.

### Por qué no filtra con `isSlug`

El sitemap principal solo publica fichas cuyo slug cumple la regla vigente, porque una con otro formato no podría servirse. Acá la ruta es la que el origen tenía, la cumpla o no: un slug viejo con mayúsculas es una URL que Google tiene indexada y que hay que redirigir igual. Filtrarlo la dejaría fuera del sitemap sin que nada lo señale.

### Criterio de retiro

El sitemap se retira cuando la bitácora de indexado muestre que Google procesó las redirecciones: **la mayoría de las `/story` con rastreo posterior al deploy y fuera del índice**.

- En Search Console, el estado **"Page with redirect"** para esas URLs es **lo esperado**, no un problema a corregir.
- **Tope:** 8 semanas después del deploy, aunque el criterio no se haya cumplido del todo.

El retiro se trackea en [#2566](https://github.com/cuentoneta/cuentoneta/issues/2566). El `TODO` de `src/server.ts` apunta a ese issue.

### Procedimiento de retiro

1. Borrar `src/api/modules/sitemap/sitemap-legacy.*` (repository, service, controller y sus specs) y `src/api/_queries/sitemap-legacy.query.*`.
2. Quitar de `src/server.ts` el import, el montaje de `/sitemap-legacy.xml` y el `TODO`.
3. Quitar de `public/robots.txt` la línea del segundo `Sitemap:` y su comentario.
4. Borrar `e2e/seo/sitemap-legacy.spec.ts` y `docs/api/bruno/utilities/get-sitemap-legacy-xml.bru`, y ajustar `docs/api/bruno/utilities/get-robots-txt.bru` si menciona los dos sitemaps.
5. Borrar esta sección (la 2) y la fila del sitemap de la tabla inicial.
6. Regenerar los tipos de Sanity (`pnpm sanity:run-typegen-generator`) para que desaparezca el tipo de la query borrada.
7. Dar de baja `sitemap-legacy.xml` en Search Console.

**Se quedan**: el módulo `legacy-route` (las redirecciones son permanentes) y `src/testing/legacy-migration.scenario.ts`, que también usan los specs de las queries y del repository de `legacy-route`.
