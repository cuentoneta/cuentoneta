<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Bitácora de cambios (changelog)

Esta bitácora de cambios detalla los hitos principales en el desarrollo de La Cuentoneta, más la lista de características y contenido deseable futuro

para el desarrollo de la plataforma de La Cuentoneta. Cabe mencionar que este cronograma es flexible y podrían agregarse otros hitos adicionales según las oportunidades que surjan durante el avance del proyecto, debido a su naturaleza abierta y colaborativa.

## Versión 2.7.0 (2025-11-23)

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

* [#1367] - Agregado de la V1 de la lista de stories, a manera de módulo interno. Si bien la navegación hacia el mismo se encuentra oculta, puede navegarse hacia la ruta `/stories` para ver la lista completa de stories y alimentar, así, a la indexación de los buscadores.

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
[storylist-verano-2022]: https://www.cuentoneta.ar/storylist?slug=verano-2022
[storylist-otoño-2023]: https://www.cuentoneta.ar/storylist?slug=otono-2023
[storylist-fec-english-sessions]: https://www.cuentoneta.ar/storylist?slug=fec-english-sessions
[dc-fec]: https://discord.com/invite/frontendcafe

<!-- Enlaces a Redes Sociales -->

[instagram-cuentoneta]: https://instagram.com/cuentoneta
[twitter-cuentoneta]: https://twitter.com/cuentoneta
[facebook-cuentoneta]: https://facebook.com/cuentoneta
