<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Bitácora de cambios (changelog)

Esta bitácora de cambios detalla los hitos principales en el desarrollo de La Cuentoneta, listando las características agregadas en cada una de las versiones del proyecto.

La lista de características futuras a implementar puede hallarse en la sección [issues](https://github.com/cuentoneta/cuentoneta/issues) del repositorio de Github del proyecto.

Los hitos futuros de desarrollo, en los cuales se detallan las funcionalidades a desarrollar y los cambios a implementar, pueden encontrarse en las secciones [milestones](https://github.com/cuentoneta/cuentoneta/milestones) y [projects](https://github.com/cuentoneta/cuentoneta/projects) del repositorio de Github del proyecto.

## Versión 2.8.5 (2026-07-15)

La versión 2.8.5 consolida la **indexación por SSR** de las fichas de autor, que era el mayor punto ciego de SEO pendiente. La ficha de autor ahora completa su render en el servidor —hidratación incremental y biografía servida aunque esté detrás de tabs— en lugar de emitir un body vacío por los `@defer`/tabs que solo montaban en cliente (#1771), con un hotfix previo que reemplazó los `@defer` por `@if` plano para restaurar el H1, la biografía y los enlaces `/story/` en el HTML crudo (#1773). Sobre esa corrección se incorpora una **suite de verificación del HTML SSR** (invariantes de indexado con cobertura Vitest, e2e contra el build de producción y un smoke post-deploy sobre el sitemap) para blindar que el indexado no vuelva a romperse silenciosamente (#1772).

En el frente de **tooling del Studio**, se cierra el punto ciego por el que un breakage de `cms/` llegaba a `develop` sin señal: se agrega el gate de CI `studio-build`, que compila el Studio (`sanity build`) en cada PR (#1799), y se arregla el build roto por el bump mayor de `@sanity/icons` v5 —imports migrados a subpaths + `packageExtensions` para plugins phantom— que había motivado el gate (#1800). El Studio además visibiliza la landing page activa (acceso directo y badges de estado en la lista) y corrige el subtítulo 'Inactiva' fantasma (#1759).

Finalmente, el proyecto adopta la actualización mayor de framework a **Angular 22.0 y Nx 23.1** (#1482), acompañada de un template de issue para futuras actualizaciones de Angular (#1778) y la extensión del gate de lint para cubrir `e2e/**`, antes fuera de su alcance (#1731). En el pipeline de release, se automatiza la creación del PR `develop → master` vía GitHub Action (#1758) y se limpian scripts de migración one-off ya obsoletos (#1754).

### Cambios completos

Ver el changelog completo en [2.8.5](https://github.com/cuentoneta/cuentoneta/releases/tag/2.8.5)

### Cambios

#### SEO / SSR / indexado

- [#1771] - Completa el render SSR de la ficha de autor: hidratación incremental y biografía tab-gated servida en el HTML del servidor.
- [#1773] - (Hotfix) Reemplaza los `@defer` de la ficha de autor por `@if` plano para restaurar H1, biografía y enlaces `/story/` en el SSR crudo.
- [#1772] - Suite de verificación del HTML SSR crudo: core puro de invariantes de indexado con cobertura Vitest, e2e contra el build de producción y smoke post-deploy (`pnpm seo:smoke`) muestreando el sitemap.

#### Studio / CMS y tooling de build

- [#1799] - Agrega el gate de CI `studio-build` (`sanity build`) que compila el Studio en cada PR, más el script `pnpm sanity:build` para reproducirlo en local.
- [#1800] - Arregla el build del Studio con `@sanity/icons` v5: imports migrados a subpaths y `packageExtensions` para plugins phantom.
- [#1759] - Visibiliza la landing page activa en el Studio (acceso directo + badges de estado en la lista) y corrige el subtítulo 'Inactiva' fantasma.

#### Framework y tooling

- [#1482] - Actualiza Angular a la versión 22.0 y Nx a la 23.1 (adopción de defaults de v22/TS6).
- [#1778] - Agrega un template de issue para actualizaciones de Angular.
- [#1731] - Extiende el gate de lint (`eslint:lint`) para cubrir `e2e/**`, antes fuera de su alcance.

#### Automatización de release y mantenimiento

- [#1758] - Automatiza la creación del PR de release `develop → master` vía GitHub Action.
- [#1754] - Limpieza de scripts de migración one-off ya obsoletos.

#### Correcciones

- [#1770] - (Hotfix) Correcciones en el lineado de `CollectionTeaser`.

## Versión 2.8.4 (2026-07-08)

La versión 2.8.4 corrige y endurece la generación automática de las páginas de inicio semanales. El cron `add-next-weeks-landing-page-content` había dejado de anclarse a la semana curada y clonaba indefinidamente el último stub futuro autogenerado, produciendo un bache entre la semana vigente y las siguientes; ahora la query selecciona la última semana válida no futura (`config <= semana actual`) y el formato del slug pasa a `YYYY-WW` para que su orden lexicográfico coincida con el cronológico (#1749).

Sobre esa base, la numeración de semana adopta la convención **ISO-8601** (lunes = día 1, semana del primer jueves) en lugar del default de locale de `date-fns` (domingo), alineando el identificador con la convención esperada. Ambos cambios incluyen scripts de migración de datos con dry-run y manejo de colisiones de borde de año (#1751).

Además, se incorpora formalmente el hotfix de SSR que restaura la confianza en los proxy headers de Vercel (`trustProxyHeaders`), corrigiendo el deopt a CSR que había afectado la indexación en Google Search Console (#1730).

### Cambios completos

Ver el changelog completo en [2.8.4](https://github.com/cuentoneta/cuentoneta/releases/tag/2.8.4)

### Cambios

#### Páginas de inicio y cron de contenido

- [#1749] - Anclaje del cron de páginas de inicio a la última semana válida no futura (`config <= semana actual`, orden `config desc`) y migración del formato de slug de `WW-YYYY` a `YYYY-WW` (orden lexicográfico = cronológico), con ordenamiento cronológico en Sanity Studio.
- [#1751] - Adopción de numeración de semana **ISO-8601** (lunes = día 1) para el slug de las páginas de inicio, con script de migración (dry-run + manejo de colisiones de borde de año).

#### Correcciones

- [#1730] - (Hotfix) Confianza en los proxy headers de Vercel en el SSR (`trustProxyHeaders`) para evitar el deopt a CSR que afectaba la indexación en Google Search Console.

## Versión 2.8.3 (2026-07-06)

La versión 2.8.3 se enfoca en la robustez del render SSR y en la higiene de SEO/AEO, cerrando dos epics. El epic de render SSR (#1697) corrige la causa raíz por la que las rutas dinámicas (`home`, `story/:slug`, `author/:slug`, `storylist/:slug`) servían un skeleton sin contenido ni meta indexables: los recursos de página ahora **bloquean la serialización del SSR** hasta resolver (`ssrBlockingRxResource` vía `pendingUntilEvent`), conservando la carga progresiva de los datos secundarios (`progressiveRxResource`). Una regla ESLint impide reintroducir la regresión al prohibir `rxResource`/`httpResource` crudos en páginas.

En el frente de SEO/AEO (epic #1525), se estandarizan las URLs canónicas con `buildCanonicalUrl` (corrige el bug de doble slash) tanto en las páginas de detalle como en `about`/`authors`/`dmca`/`stories`, se emite `og:url` por página en el SSR (antes estático al home) y se unifica el host de `sitemap.xml` y `robots.txt` a `www.cuentoneta.ar`.

En infraestructura, se incorpora un gate de CI de type-checking estricto (`tsc --noEmit`) y se depuran los casts del corpus de tests del ACL. Además, se proveen imágenes de ejemplo locales para las stories de `Carousel` y `Author`, se corrigen un fetch de navegación con slug vacío (404) y el `data-testid` de `MediaResourceTag`, y se suma una tanda de actualizaciones de dependencias.

### Cambios completos

Ver el changelog completo en [2.8.3](https://github.com/cuentoneta/cuentoneta/releases/tag/2.8.3)

### Cambios

#### SEO y render SSR

- [#1704] - Bloqueo del SSR hasta resolver los recursos async de las páginas (`ssrBlockingRxResource`/`progressiveRxResource` vía `pendingUntilEvent`), para que el HTML server-rendered sirva contenido y meta resueltos (epic #1697).
- [#1705] - Regla ESLint que prohíbe `rxResource`/`httpResource` crudos en páginas, forzando la decisión de bloqueo de SSR (`ssrBlockingRxResource`/`progressiveRxResource`).
- [#1706] - Estandarización de las URLs canónicas con `buildCanonicalUrl` (corrige el doble slash) en las directivas de meta de story, author y storylist.
- [#1709] - Extensión de `buildCanonicalUrl` a `about`/`authors`/`dmca`/`stories` (mismo bug de doble slash).
- [#1707] - Emisión de `og:url` por página en el SSR (antes estático al home).
- [#1703] - Unificación del host de `sitemap.xml` y `robots.txt` a `www.cuentoneta.ar`.

#### Tooling e infraestructura

- [#1691] - Gate de CI de type-checking estricto (`tsc --noEmit`) como gate obligatorio en cada PR.
- [#1681] - Eliminación de los casts `null as unknown as` en los tests del ACL (coverImage real).

#### Storybook y tests

- [#1676] - Imágenes de ejemplo locales para las stories del `Carousel` y de `Author`.

#### Correcciones

- [#1715] - Corrección del fetch a `/author//navigation` (404) cuando `navigationSlug` está vacío.
- [#1702] - Corrección del `data-testid` de `MediaResourceTagComponent` (deriva de la key del icono, no del objeto crudo).

#### Dependencias

- [#1664] - Bump de `@angular/ssr` de 21.2.14 a 21.2.17.
- [#1665] - Bump de `@angular/cli` de 21.2.14 a 21.2.18.
- [#1667] - Bump de `@eslint/js` de 9.39.2 a 9.39.4.

## Versión 2.8.2 (2026-07-01)

La versión 2.8.2 profundiza el Design System V3 y el modelo de dominio de historias: `story` gana una portada propia (`coverImage`) con su migración de backfill, `CollectionTeaser` incorpora la variante `Multiple` (tres portadas en abanico para colecciones multi-autor), la imagen de `Collection` se unifica alrededor del value object `imagery` (`representative`/`sample`, portada editorial opcional) y las tarjetas V3 derivan su portada del propio `story`. Además, se completan los skeletons faltantes de los componentes V3 mediante stories `Estados` intercambiables (real↔skeleton).

En el Anti-Corruption Layer de Sanity, la asignación de `tags` en los mappers de teaser pasa a ser explícita y se incorpora un corpus crudo (shape Sanity) para testear mappers y services. En paralelo, se refuerza la infraestructura de tests y Storybook con un corpus de mocks enriquecido a partir de las obras de François Onoff —con sus portadas migradas a PNG—, aplicado a `StoryCardTeaserV3` y `HomeStoryCard`, se unifica la documentación de Storybook al estándar V3 y se depuran tests que afirmaban clases CSS estructurales en `CollectionTeaser`.

Finalmente, sienta la base de las OG images dinámicas (`setImage()`/`removeImage()` en `HeadMetadataDirective`), corrige la generación de URLs de imágenes de Sanity con crop, incorpora un skill `/release-workflow` dedicado a los issues de release y suma una tanda de actualizaciones de dependencias (`groq`, Hono, Sanity CLI) y de GitHub Actions.

### Cambios completos

Ver el changelog completo en [2.8.2](https://github.com/cuentoneta/cuentoneta/releases/tag/2.8.2)

### Cambios

#### Modelo de dominio y ACL

- [#1648] - `coverImage` como atributo propio de `story` para su representación visual, con migración de backfill en historias existentes.
- [#1684] - Imagen de `Collection` modelada con el value object `imagery` (`representative`/`sample`) y portada editorial (`featuredImage`) opcional, en paridad con `CollectionTeaser`.
- [#1593] - Asignación explícita de `tags: []` en los mappers de teaser de story (ACL).
- [#1678] - Corpus Onoff crudo (shape Sanity) del lado del ACL para tests de mappers y services.

#### Design System V3 y componentes

- [#1638] - Variante `Multiple` de `CollectionTeaser`: tres portadas en abanico para colecciones multi-autor.
- [#1692] - Las tarjetas `HomeStoryCard` y `StoryCardTeaserV3` derivan la portada del propio `story`, eliminando el input redundante `coverImageUrl`.
- [#1675] - Skeletons faltantes de los componentes V3 con stories `Estados` intercambiables (real↔skeleton).

#### Storybook, tests y corpus de mocks

- [#1650] - Corpus de mocks de `Story` enriquecido con las obras de François Onoff.
- [#1655] - Portadas mock del corpus de Onoff migradas de SVG a PNG (236×328).
- [#1657] - Refuerzo de tests y Storybook de `StoryCardTeaserV3` con el corpus de Onoff.
- [#1669] - Refuerzo de tests y Storybook de `HomeStoryCard` con el corpus de Onoff.
- [#1631] - Auditoría de documentación V3 en Storybook: unificación al estándar de `StoryCardTeaserV3` y `TagComponent`.
- [#1639] - Limpieza de tests que afirmaban clases CSS en `collection-teaser` (testear comportamiento, no estructura).

#### SEO y OpenGraph

- [#1535] - Base de las OG images dinámicas: `setImage()` y `removeImage()` en `HeadMetadataDirective`, con fallback al logo estático.

#### Correcciones

- [#1694] - Corrección de la generación de URLs de imágenes de Sanity con crop (helper `withSanityImageParams`), que producía un doble `?` y un `rect` inválido.

#### Flujos de trabajo y agentes de IA (Claude)

- [#1685] - Skill `/release-workflow` dedicado a los issues de release.

#### Dependencias e infraestructura

- [#1613] - Actualización de `groq` a la versión 6.1.0.
- [#1619] - Actualización de `@hono/node-server` a la versión 2.0.6.
- [#1611] - Actualización de `@sanity/cli` a la versión 7.2.3 (CMS).
- [#1612] · [#1662] · [#1660] · [#1608] - Actualización de los grupos `minor-and-patch` de dependencias de app y CMS (Dependabot).
- [#1636] · [#1637] · [#1659] - Auto-bump de GitHub Actions (`pnpm/action-setup`, `actions/checkout`, `actions/cache`) vía Dependabot.

## Versión 2.8.1 (2026-06-23)

La versión 2.8.1 continúa la implementación del Design System V3 con cuatro nuevas entregas: el componente `StoryCardTeaserV3` y el nuevo `HomeStoryCard`, el reemplazo de `BadgeComponent` por `TagComponent` en todos sus usos con documentación de story desde Figma, la adopción de `CoverImageComponent` en el `CollectionTeaser` y la reconciliación de tags en las vistas de story y autor con soporte de override de color.

En paralelo, moderniza el tooling y la infraestructura de CI: actualización de Nx a la versión 23.0, angular-eslint a 21.4.0 con migración del executor `@nx/eslint:lint` deprecado, la migración de la configuración de Sanity TypeGen a `sanity.cli.ts`, la automatización completa del flujo de release (tag + release notes + deploy de Sanity Studio) y la configuración de Dependabot para el auto-bump de GitHub Actions.

### Cambios completos

Ver el changelog completo en [2.8.1](https://github.com/cuentoneta/cuentoneta/releases/tag/2.8.1)

### Cambios

#### Design System V3 y componentes

- [#1510] - Implementación de `StoryCardTeaserV3` y `HomeStoryCard` (Design System V3).
- [#1629] - Reemplazo de `BadgeComponent` por `TagComponent` y documentación de su story desde Figma.
- [#1633] - Adopción de `CoverImageComponent` en `CollectionTeaser`.
- [#1569] - Tags en las vistas de story y autor, reconciliación de tags de autor y override de color en tag.

#### Tooling, CI y mantenimiento

- [#1640] - Actualización de angular-eslint a 21.4.0 y migración del executor `@nx/eslint:lint` deprecado.
- [#1622] - Actualización de Nx a la versión 23.0.
- [#1624] - Migración de la configuración de Sanity TypeGen de `sanity-typegen.json` a `sanity.cli.ts`.
- [#1590] - Automatización del flujo de release: tag, release notes y deploy de Sanity Studio.
- [#1584] - Configuración de Dependabot para el auto-bump de versiones de GitHub Actions.

## Versión 2.8.0 (2026-06-20)

La versión 2.8.0 implementa parcialmente el Design System V3 con una nueva familia de componentes —avatares circulares, tags con recorte por ancho, teasers de autor y skeletons de carga propios— y reemplaza la dependencia `ngx-skeleton-loader` por una implementación in-house.

En paralelo, impulsa un trabajo extenso de SEO y AEO: datos estructurados con JSON-LD (`Organization`, `WebSite`, `Article`, `Person`, `CollectionPage` y `BreadcrumbList`), señales E-E-A-T en las páginas de cuento, una jerarquía de headings correcta (un único `H1` por página) y la encapsulación de toda la lógica SEO en host directives dedicadas por página, con cobertura de tests e2e.

Finalmente, moderniza el tooling y la arquitectura del proyecto —migración de Jest a Vitest, endurecimiento de las reglas de ESLint, adopción de la propiedad `host` del decorador y la incorporación de flujos de trabajo basados en agentes de IA (Claude)— y robustece la integración continua con cache de tareas de Nx, la automatización de la replicación de datasets de Sanity y mejoras de seguridad ante PRs externos.

### Cambios completos

Ver el changelog completo en [2.8.0](https://github.com/cuentoneta/cuentoneta/releases/tag/2.8.0)

### Cambios

#### Design System V3 y componentes

- [#1510] - Implementación del componente `StoryMediaSelectors`.
- [#1512] - Componente `ImageProfile`, el avatar circular del Design System v3.
- [#1514] - El campo de redes sociales del colaborador pasa a ser opcional.
- [#1515] - Componentes `Tag` y `TagsList` (DS v3) con recorte de etiquetas por ancho.
- [#1509] - Componente `AuthorTeaser` V3 con avatar, tags recortables y skeleton de carga.
- [#1486] - Reemplazo de `ngx-skeleton-loader` por un componente de skeleton propio.
- [#1581] - Convención de story de Storybook intercambiable para componentes con estado de carga.
- [#1583] - Categoría "Componentes V3" en Storybook y skeleton del componente `Tag`.

#### SEO y AEO

- [#1518] - Title descriptivo en la home y meta `robots` permisivo en el SSR.
- [#1519] - Corrección de la jerarquía de headings: un único `H1` por página.
- [#1520] - `SchemaOrgService` (SSR) e inyección del JSON-LD de `Organization` y `WebSite`.
- [#1521] - Datos estructurados `Article`/`Person` y señales E-E-A-T en las páginas de cuento.
- [#1522] - Datos estructurados en autor y storylist (`Person`, `CollectionPage`) más `BreadcrumbList`.
- [#1523] - Contenido indexable en la home mediante la sección "Sobre La Cuentoneta".
- [#1524] - Keywords específicas y relevantes en el meta tag de la home.
- [#1564] - Fechas de creación y actualización de la ficha de autor en el JSON-LD `ProfilePage`.
- [#1565] - Encapsulamiento de la lógica SEO de cada página en host directives dedicadas (meta tags + JSON-LD).
- [#1578] - Limpieza de los bloques JSON-LD de página al navegar hacia la home.
- [#1577] - Tests e2e de meta tags y JSON-LD en home, story, author y storylist.

#### Arquitectura, linting y testing

- [#1494] - Migración del proyecto de Jest a Vitest.
- [#1499] - Adopción del patrón de API providers (`*.service.ts` → `*.provider.ts`).
- [#1500] - Adopción del enforcement de ESLint al estilo ResetShop.
- [#1542] - Reemplazo de `@HostListener`/`@HostBinding`/`:host { @apply }` por la propiedad `host` del decorador.
- [#1547] - Regla de ESLint que prohíbe `@HostListener` y `@HostBinding`.
- [#1548] - Colapso de los wrappers de componentes a `host: { class }`.
- [#1552] - Habilitación de la regla `@angular-eslint/no-uncalled-signals` (typed-linting).

#### Flujos de trabajo y agentes de IA (Claude)

- [#1495] - Creación de `CLAUDE.md` y los archivos de referencia de Claude.
- [#1501] - Portado de los subagentes y el skill `issue-workflow`.
- [#1502] - Versionado de la configuración de Claude de equipo (`.mcp.json` + `settings.json`).

#### Integración continua e infraestructura

- [#1528] - Eliminación de la propiedad `public` en `vercel.json`.
- [#1550] - Hotfix de CI: compartir el workspace entre jobs mediante artifacts en lugar de cache.
- [#1587] - Configuración del workspace de Nx.
- [#1493] - Automatización de la replicación diaria del dataset de producción hacia staging y development.
- [#1553] - Cache de tareas de Nx en CI (Nx Cloud + fallback `actions/cache`) y hardening ante PRs desde forks.

## Versión 2.7.4 (2026-06-10)

La versión 2.7.4 está dominada por la puesta al día del stack: Angular 21.2, Nx 22.6, TailwindCSS v4.3, y la actualización de Sanity, las dependencias del CMS y Storybook, junto con la resolución de alertas de seguridad de Dependabot.

Suma nuevos componentes del Design System (`Button` y `CollectionTeaser`) y ajustes de layout para desktop, mejoras en los perfiles de autor (fechas anteriores a Cristo y nombres en negrita en las biografías), el reemplazo de `rettiwt-api` por audio self-hosted en las grabaciones de Spaces, y una guía de QA para escribir test plans.

### Cambios completos

Ver el changelog completo en [2.7.4](https://github.com/cuentoneta/cuentoneta/releases/tag/2.7.4)

### Cambios

#### Design System, componentes y layout

- [#1463] - Implementación del componente `Button`.
- [#1465] - Implementación del componente `CollectionTeaser`.
- [#1466] - Actualización del layout y los tamaños para pantallas desktop.

#### Actualizaciones de framework y dependencias

- [#1473] - Actualización a Angular 21.1 y Nx 22.4.
- [#1474] - Actualización del codebase a Nx v22.6.4 y Angular v21.2.6.
- [#1295] - Migración de TailwindCSS a v4.3 y su configuración completa.
- [#1487] - Actualización de Sanity y las dependencias del CMS a sus últimas versiones.
- [#1488] - Actualización de Storybook a la versión 10.4.2.
- [#1490] - Resolución de las alertas de seguridad de Dependabot en las dependencias de la raíz.

#### Contenido, autores y multimedia

- [#1478] - Soporte de fechas anteriores a Cristo (a.C.) en los perfiles de autor.
- [#1483] - Nombre del autor en negrita en las biografías y reubicación de los scripts de diagnóstico.
- [#1438] - Reemplazo de `rettiwt-api` por audio self-hosted en `spaceRecording`.

#### Integración continua, QA y documentación

- [#1497] - Eliminación de las actions de Claude Code del pipeline de CI.
- [#1115] - Guía de QA para escribir un test plan y reorganización de `docs/qa`.

## Versión 2.7.3 (2026-01-07)

Implementados primeros cambios relacionados al diseño de la V3, entre los que se incluyen el design system completo y el reemplazo del carousel de contenido por una implementación nativa en Angular propia del proyecto, reemplazando la dependencia de `ngx-owl-carousel-o`.

Agregadas mejoras en SEO de la mano de la implementación de un endpoint para sitemaps y modificados los perfiles de autor agregando fechas de nacimiento y fallecimiento, las cuales se usarán posteriormente para enriquecer la experiencia de la plataforma.

## Versión 2.7.2 (2025-12-22)

Abordados problemas visuales, de lógica y de accesibilidad menores, conjuntamente con la actualización de la plataforma a Nx 22.3 + Angular 21 y una serie de cambios orientados a simplificaciones arquitectónicas de la plataforma:

- Se eliminó de la base de código el uso de los modelos de dominio `Publication`, los cuales oficiaban de nexto entre los modelos de dominio `Story` y `Storylist`.
- Se eliminó el servicio `ThemeService`, reemplazando sus usos por código CSS nativo + ng-deep.

### Cambios completos

Ver el changelog completo en [2.7.2](https://github.com/cuentoneta/cuentoneta/releases/tag/2.7.1)

## Versión 2.7.1 (2025-12-10)

Versión menor que trae aparejados cambios para robustecer y volver más performante el backend, reemplazar la herramienta utilizada como API client y eliminar el uso de ngxtension. Respecto de características de la plataforma, se elimina el soporte multilenguaje.

### Cambios completos

Ver el changelog completo en [2.7.1](https://github.com/cuentoneta/cuentoneta/releases/tag/2.7.1)

## Versión 2.7.0 (2025-11-24)

Esta versión trae aparejados cambios estructurales, entre las cuales se incluyen la creación de las primeras iteraciones de una variedad de módulos y la eliminación de gran cantidad de información estática, a lo cual se agregan la expansión del soporte multimedia de la plataforma, ajustes en las características orientadas a SEO y, especialmente, en la capacidad de la plataforma para llevar adelante la actualización programada de contenido.

### Cambios completos

Ver el changelog completo en [2.7.0](https://github.com/cuentoneta/cuentoneta/releases/tag/2.7.0)

### Cambios

#### Visualización, gestión y actualización del contenido

- [#1176] - Agregado de la V1 del módulo Últimas novedades, permitiendo visualizar historias seleccionadas, a manera de novedad, en la landing page.
- [#455] - Listado de colaboradores en `/about` de forma programática, declarando los colaboradores en el nuevo schema `contributor` de Sanity Studio.
- [#914] - Definir estrategias de actualización de contenido
- [#1274] - Agregado de la V2 del Perfil de autor, a fin de poder separar la visualización de las stories de un autor con su biografía.

#### Imágenes y multimedia

- [#1373] - Agregado de nuevas imágenes y textos en carousel de la landing page
- [#1215] - Agregado de la Reproducción de contenido desde Spotify

#### SEO

- [#1366] - Introducción de keywords en vistas de detalles de Story, Storylist y Author

- [#1367] - Agregado de la V1 de la lista de stories, a manera de módulo interno. Si bien la navegación hacia el mismo se encuentra oculta, puede navegarse hacia la ruta `/stories` para ver la lista completa de stories y alimentar, así, a la indexación de los buscadores.

#### Testing y gestión de calidad

- [#1344] - Creación del archivo de plantilla de pruebas

#### Documentación y especificaciones

- [#912] - Agregada la especificación inicial del módulo `comunidades`
- [#831] - Agregar documentación sobre modelos de dominio

#### Mejoras en tooling e infraestructura

- [HF] - Remueve Vercel Speed Insights del proyecto
- [#1370] - Migración del proyecto desde SCSS a CSS
- [#1304] - Inyección dinámica de íconos

#### Resolución de errores

- [#1356] - Corrige `navigationSlug` para navegación desde vista de storylist

## Versión 2.6.5 (2025-11-02)

Ver el changelog completo en [2.6.5](https://github.com/cuentoneta/cuentoneta/releases/tag/2.6.5)

- Abordaje de warnings y optimizaciones en CI/CD, Tailwind y eslint
- Agregado de componente tabs
- Migración completa del proyecto a ESM
- Mejoras en SEO mediante configuración de metatags robots y canonical
- Agregado de vista de tablas para Sanity
- Transformación de la vista de storylist para mejorar experiencia de usuario y accesibilidad
- Mejoras en el parser de Portable Text para manejo de listas
- Publicación de la storylist "Misceláneas Tertulianas"

## Versión 2.6.4 (2025-09-29)

Ver el changelog completo en [2.6.4](https://github.com/cuentoneta/cuentoneta/releases/tag/2.6.4)

- Dependencias y herramientas
  - Actualización a Angular 20.3
  - Actualización de Express a v5
  - Agregado de regla `no-barrel-files` a eslint
- Componentes
  - Agregado de todas las variantes definidas en [Figma](https://www.figma.com/design/A9PdBCdmoyZrN7FKMpann8/La-Cuentoneta-v3?node-id=3233-8637&t=UxlOPYPb6BZAyXBr-0) del componente `StoryCardTeaserComponent`
  - Estandarización de íconos utilizando `ng-icons` en reemplazo de íconos en SVG.

- Cambios menores
  - Resuelto problema de flickering en carga de landing page al cambiar configuración para ejecución del backend en Vercel
  - Agregado de smoke tests para `AuthorSkeletonComponent` y `StoryCardSkeletonComponent`
  - Agregado de valores por default para usos de rxResource
  - Resolución de problemas de carga en variante Docs de las stories de Storybook
  - Refactor de `RouterTestingModule` por `providerRoute` en stories de Storybook y tests

## Versión 2.6.3 (2025-09-11)

Ver el changelog completo en [2.6.3](https://github.com/cuentoneta/cuentoneta/releases/tag/2.6.3)

- Agregado de nuevas reglas de eslint y actualización a Angular 20.2
- Redefinición de flujo de CI/CD en Github actions para correr tareas de forma paralela
- Agregado de campo `birthDate` a autores, para señalar opcionalmente su fecha de nacimiento

## Versión 2.6.2 (2025-05-03)

Ver el changelog completo en [2.6.2](https://github.com/cuentoneta/cuentoneta/releases/tag/2.6.2)

- Agregado de header de visualización dinámica para pantallas móviles
- Mejora en SEO mediante el manejo de URLs canónicas
- Actualización de Nx a versión 20.8.1

## Versión 2.6.1 (2025-03-17)

Ver el changelog completo en [2.6.1](https://github.com/cuentoneta/cuentoneta/releases/tag/2.6.1)

- Agregar alineación de texto para editor y parser de Portable Text
- Soporte para tests de integración y e2e con Playwright
- Soporte para Clarity vía el paquete `@microsoft/clarity`
- Exportar componentes como default y actualizar notación de rutas
- Solución a problemas de indexación en Google
- Actualizar proyecto a Nx 20.5.0 y Angular 19.2.1
- Reemplaza `provideServerRoutesConfig` con `provideServerRouting`
- Elimina usos forzosos de strings para routerLink
- Agregada primera versión del índice de autores, para mejorar la indexación de contenido de la web

## Versión 2.6.0 (2025-03-03)

Ver el changelog completo en [2.6.0](https://github.com/cuentoneta/cuentoneta/releases/tag/2.6.0)

- Agregada funcionalidad para visualizar historias más leídas en la landing page, con actualización diaria.
- Agregado nuevo componente para visualizar en formato resumido y escueto la navegación a stories desde la landing page.
- Eliminación de zone.js del proyecto, transformando la aplicación a zoneless.
- Implementación de rxResource para operaciones de fetch en componentes del proyecto.
- Actualización del proyecto a Angular v19.1 y Nx a versión 20.4.

## Versión 2.5.3 (2025-02-06)

Ver el changelog completo en [2.5.3](https://github.com/cuentoneta/cuentoneta/releases/tag/2.5.2)

- Completada la migración de tests unitarios funcionales utilizando Angular Testing Library.
- Optimizaciones en carga de imágenes e íconos.
- Arreglos en la generación de links del componente `ShareContentComponent`.
- Estandarización de tooltips en la plataforma.
- Agregado de archivo robots.txt a la plataforma para mejorar SEO.
- Actualización de guía de desarrollo.
- Actualización del proyecto a Angular v19.0 y Nx a versión 20.2.

## Versión 2.5.2 (2024-12-01)

Ver el changelog completo en [2.5.2](https://github.com/cuentoneta/cuentoneta/releases/tag/2.5.2)

- Incorporación de nuevos tests unitarios funcionales utilizando Angular Testing Library.
- Optimizaciones en carga de imágenes e íconos.
- Agregado de conector a Microsoft Clarity, incluyendo implementación mock.
- Agregado automático de tag `✍️ bosquejo` a los issue templates de Github.

## Versión 2.5.1 (2024-11-15)

Ver el changelog completo en [2.5.1](https://github.com/cuentoneta/cuentoneta/releases/tag/2.5.1)

- Migración completa del proyecto y su configuración a ESLint 9.
- Incorporación de nuevos tests unitarios funcionales utilizando Angular Testing Library.
- Mejoras de accesibilidad en uso de tags de heading y anchors de navegación.
- Agregado de filtrado de drafts para contenido de Sanity.
- Creación de archivo .env para proyecto de Sanity.
- Actualizado layout de vista /storylist
- Agregado de las storylists "Ciudades Campos, Pueblos, Islas" y "Conspiración Cero"

## Versión 2.5.0 (2024-10-28)

Ver el changelog completo en [2.5.0](https://github.com/cuentoneta/cuentoneta/releases/tag/2.5.0)

- Actualización a Angular 18.2 y Nx 20.0.
- Eliminación de grids dinámicas en favor de grids estáticas para el contenido de los decks de cards de las storylists, simplificando la estructura de los componentes y facilitando el mantenimiento y agregado de contenido a la plataforma.
- Implementación de la funcionalidad "Campañas de Contenido", que permitirá a los administradores de la plataforma crear y publicar campañas de contenido en la landing page.
- Mejoras en la experiencia de usuario de la plataforma, incluyendo mejoras en la navegación y en la visualización de los relatos acorde a un primer paso en la adaptación de los diseños de la v3 de la plataforma.
- Publicación de la primera campaña de contenido en la landing page: "Pluma de la semana #1: Horacio Quiroga".
- Incorporación de nuevos tests unitarios funcionales utilizando Angular Testing Library.
- Actualización de Storybook a la versión 8.3.5 y ESLint a la versión 9.10.

## Versión 2.4.3 (2024-08-12)

Ver el changelog completo en [2.4.3](https://github.com/cuentoneta/cuentoneta/releases/tag/2.4.2)

- Actualización a Angular 18.1 y Nx 19.3.
- Mejoras profundas relacionadas a la experiencia de desarrollo (DX) de la plataforma.
  - Cobertura de tipos del 100% a lo largo y ancho del proyecto.
  - Puesta en funcionamiento de Github Actions de linting y testing unitario en el pipeline de CI/CD del proyecto.
  - Migración total a signals de los inputs de los componentes del proyecto.

## Versión 2.4.2 (2024-06-24)

Ver el changelog completo en [2.4.2](https://github.com/cuentoneta/cuentoneta/releases/tag/2.4.2)

- Actualización a Angular 18 y Nx 19.1.
- Implementación de la funcionalidad "Perfil de Autor", mediante la cual pueden visualizarse todos los relatos de un autor en la plataforma.
- Múltiples mejoras de performance y experiencia de desarrollo interna de la plataforma.

## Versión 2.4.1 (2024-05-22)

Ver el changelog completo en [2.4.1](https://github.com/cuentoneta/cuentoneta/releases/tag/2.4.1)

- Actualización de documentación y creación de la guía completa de desarrollo de la plataforma.
- Evaluación de métricas utilizando Microsoft Clarity.
- Agregado soporte de epígrafes multilínea en la plataforma.
- Reintroducción de barra de progreso en la vista de lectura.
- Introducción de nuevo parser para visualización de Portable Text.
- Manejo de videos de YouTube como un recurso multimedia, eliminando lógica previa dedicada.
- Agregado de slugs para autores y modelos relacionados.
- Actualización de Angular a versión 17.3.3.
- Ajustes de márgenes en viewports mobile.
- Implementación de Github Actions para CI/CD.
- Otros ajustes menores en accesibilidad y DX.

## Versión 2.4.0 (2024-03-30)

- Lanzamiento de la edición "Cuentos por Malvinas" para conmemorar el 41° aniversario del "Día del Veterano y de los Caídos en la Guerra de Malvinas".
- Actualización del workspace a Nx 18.1.0 y de la aplicación a Angular 17.2.4
- Inclusión de recursos multimedia en formato audio
- Actualización de NodeJS a versión 20.11.1, eliminando la dependencia con dotenv.
- Aplicada nueva estrategia basada en esbuild y el builder application para compilación del proyecto.
- Solucionado problema con hot reload en modo dev.
- Reemplazo de queryParams por params en las rutas de la aplicación.
- Agregado ícono de stories con spaces de X para componente `PublicationCardComponent`.

## Versión 2.3.4 (2024-03-22)

- Migración de las tags \*ngFor a sintaxis de control de flujo de Angular 17 (@for)
- Implementación de estilos basados en TailwindCSS para todos los componentes de la aplicación.
- Actualización del workspace a Nx 18.0.0 y de la aplicación a Angular 17.1.2

## Versión 2.3.3 (2024-02-02)

- Agregado soporte para enlace de múltiples recursos web y multimedia a la plataforma
- Migración de tags \*ngIf a sintaxis de control de flujo de Angular 17.
- Mejoras en infraestructura de SCSS vía TailwindCSS.
- Corrección y flexibilidad en el estilizado de epígrafes.
- Agregado de Speed Insights de Vercel a la plataforma.
- Actualización de schemas y modelos para mayor flexibilidad en relaciones entre entidades.

## Versión 2.3.2 (2024-01-10)

- Agregado soporte para visualización de grabaciones de Spaces de X en vista de historia.

## Versión 2.3.1 (2024-01-04)

- Búsqueda de community manager y diseñadores gráficos para trabajar en las futuras características del sitio web.
- Agregado de mejoras en textos de reseñas y biografías de autores, soportando links y formato en negritas e itálicas.

## Versión 2.3.0 (2023-12-21)

- Preparación de la lista "Cuentos de Verano 2024" en la plataforma.
- Rediseño de la landing page, incluyendo storylists en formato tarjeta.

## Versión 2.2.2 (2023-11-23)

- Preparación de la storylist "Ensayos Latinoamericanos", en colaboración con la comunidad **[Tertulia Literaria](https://discord.gg/tertulia-literaria-795704695485235231)**.
- Actualizaciones de herramientas y tecnologías utilizadas en el desarrollo de la plataforma: soporte para Angular
  17 y Nx 17.

## Versión 2.2.0 (2023-10-16)

- Preparación de la storylist "Cuentos de Primavera", una colección de 15 cuentos de autoras latinoamericanas.
- Preparación del ciclo "Cuentos de Terror de Alberto Laiseca" mediante la publicación de los videos del ciclo televisivo transmitido en el canal "iSat" de la década del 2000. Cada cuento de la storylist estará acompañados de contenido multimedia en la plataforma. Esta storylist hará las veces de conmemoración del mes de Noche de Brujas, publicando originalmente un cuento por día durante todo el mes de octubre y se extenderá para cubrir paulatinamente todas las emisiones del ciclo original.

## Versión 2.1.0 (2023-07-06)

- Lanzamiento del ciclo "[Cuentos de Otoño 2023][storylist-otoño-2023]".

## Versión 2.0.0 (2023-05-31)

- Apertura a la [comunidad de FrontendCafé][dc-fec] para la colaboración en el desarrollo de la plataforma.
- Creación de las redes sociales de "La Cuentoneta" ([Instagram][instagram-cuentoneta], [Twitter][twitter-cuentoneta], [Facebook][facebook-cuentoneta]) para fomentar la participación del público general en la plataforma.
- Adaptación de la storylist Cuentos de Verano 2022 a la nueva plataforma, rebautizándola como "[La Cuentontoneta 1.0][storylist-verano-2022]".
- Lanzamiento de la storylist
  "[FEC English Sessions Short Stories][storylist-fec-english-sessions]", una storylist en constante actualización con cuentos cortos en inglés para practicar el idioma en el grupo de estudio de FrontendCafé.

## Versión 1.0.0 (2022-01-01)

- Versión inicial de La Cuentoneta (rama de desarrollo disponible en `release/1.0`.

<!-- Listado de enlaces de referencia, mantenerlos actualizados en cada archivo -->

[web]: https://cuentoneta.ar
[storylist-verano-2022]: https://www.cuentoneta.ar/storylist/verano-2022
[storylist-otoño-2023]: https://www.cuentoneta.ar/storylist/otono-2023
[storylist-fec-english-sessions]: https://www.cuentoneta.ar/storylist/fec-english-sessions
[dc-fec]: https://discord.com/invite/frontendcafe

<!-- Enlaces a Redes Sociales -->

[instagram-cuentoneta]: https://instagram.com/cuentoneta
[twitter-cuentoneta]: https://twitter.com/cuentoneta
[facebook-cuentoneta]: https://facebook.com/cuentoneta
