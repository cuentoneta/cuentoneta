# Rutas viejas: redirecciones y sitemap temporal

Las URLs indexadas de la plataforma anterior (`/story`, `/storylist`) responden con un 301 a las rutas vigentes (`/literary-work`, `/collection`). Este documento describe cómo se arma el destino y el sitemap temporal que le pide al buscador que vuelva a rastrearlas.

## 1. Redirecciones permanentes

Viven en `src/api/_middleware/legacy-route-redirects.middleware.ts` y se montan en `src/server.ts`, antes de los estáticos y del catch-all SSR.

| Ruta vieja         | Destino                 |
| ------------------ | ----------------------- |
| `/story`           | `/literary-work`        |
| `/storylist`       | `/collection`           |
| `/story/:slug`     | `/literary-work/<slug>` |
| `/storylist/:slug` | `/collection/<slug>`    |

El slug se traslada tal cual, salvo el de las obras cuyo slug cambió durante la mudanza: esas excepciones están en una tabla fija en el propio middleware. La mudanza ya terminó, así que la tabla está cerrada. La query string se preserva, porque es donde viajan los parámetros de campaña.

## 2. Sitemap temporal

`public/sitemap-legacy.xml` lista las URLs viejas de las obras y colecciones migradas para que el buscador las vuelva a pedir, vea el 301 y consolide cada una en su URL nueva. Lo sirve `serveStatic` y se declara como segundo `Sitemap:` en `public/robots.txt`. El sitemap principal (`/sitemap.xml`) no cambia.

Es un archivo estático porque el conjunto de URLs viejas está cerrado: son las de los documentos migrados, y no se van a sumar otras. Se generó una sola vez a partir de los slugs de los documentos de origen en `production`.

Todas las entradas llevan `lastmod` 2026-08-31, la fecha en que las rutas viejas pasaron a redirigir (release 2.11.0). Es la misma fecha de revisión de página que el sitemap principal usa para autores y colecciones (`sitemap.lastmod.ts`), y por el mismo motivo: Google vuelve a pedir una URL conocida cuando su `lastmod` es posterior a su última visita, y ninguna de estas URLs se rastreó después de esa fecha. No es la fecha del documento migrado, que no dice nada de la URL vieja.

### Criterio de retiro

Se retira cuando la bitácora de indexado muestre que Google procesó las redirecciones: **la mayoría de las `/story` con rastreo posterior al deploy y fuera del índice**.

- En Search Console, el estado **"Page with redirect"** para esas URLs es lo esperado, no un problema.
- **Evaluación a las 3 semanas del deploy:** si la bitácora no registra rastreos de `/story` posteriores al deploy, el sitemap no está moviendo nada y se retira sin esperar al tope.
- **Tope:** 8 semanas después del deploy.

El retiro se trackea en [#2566](https://github.com/cuentoneta/cuentoneta/issues/2566).

### Procedimiento de retiro

1. Borrar `public/sitemap-legacy.xml` y la línea del segundo `Sitemap:` de `public/robots.txt`, con su comentario.
2. Borrar `e2e/seo/sitemap-legacy.spec.ts` y `docs/api/bruno/utilities/get-sitemap-legacy-xml.bru`, y ajustar `docs/api/bruno/utilities/get-robots-txt.bru`.
3. Borrar esta sección.
4. Dar de baja el sitemap en Search Console.

Las redirecciones de la sección 1 se quedan.
