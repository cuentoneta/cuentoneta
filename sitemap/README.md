# Mediciones del documento del sitemap

Salidas crudas de `pnpm seo:smoke` contra producción, guardadas acá porque miden algo que después deja de existir: el estado del `/sitemap.xml` en un momento dado, que ningún despliegue posterior puede reconstruir.

Son una medición **distinta** de la serie de `seo-index-status/`. Esta mira el documento que el sitio publica; aquella mira qué hizo Google con cada URL. No se comparan entre sí.

## `2026-08-15-pre-2.10.1.txt` — antes del release 2.10.1

Tomada a las 10:37 UTC, con la versión 2.10.0 todavía en producción. Es la única constancia del estado que el release vino a corregir:

- 969 URLs, 966 con fecha
- **14 fechas distintas**, con el **48 %** concentrado en 2026-06-29
- Cuatro violaciones: elementos fuera de la secuencia que exige el esquema, `changefreq`, `priority`, y la concentración de fechas

El `lastmod` derivaba de `_updatedAt`, así que cualquier escritura operativa —un sync de datasets, una migración— aplanaba la señal y le anunciaba al crawler que todo el corpus había cambiado el mismo día.

## `2026-08-15-post-2.10.1.txt` — después del release

Misma medición a las 13:13 UTC, ya con 2.10.1 desplegada:

- 969 URLs, 966 con fecha — **el conteo no bajó**, que era el riesgo a vigilar
- **279 fechas distintas**, con un máximo de **3 %** en 2025-02-04
- **Cero violaciones**

El salto de casi todas las fechas de golpe es esperado por única vez: el `lastmod` pasó a derivar de una fecha de origen en vez de la de escritura.

## Cómo se reproduce

```bash
BASE_URL=https://www.cuentoneta.ar pnpm seo:smoke
```

El endpoint del sitemap tiene 6 h de `Cache-Control`; para forzar una lectura fresca, pedirlo con un parámetro de query.

Ambas salidas terminan con código 1 por las páginas `/storylist/*`, que no emiten `<h1>` ni enlaces a `/story/`. Eso es un defecto propio, ajeno a estas mediciones: el veredicto sobre el sitemap está en la sección `Sitemap:`, no en el código de salida.
