<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

**La Cuentoneta** es un proyecto abierto y sin fines de lucro que busca generar un espacio comunitario para difundir escritos en literatura breve. Esta iniciativa fue gestada originalmente por un grupo de amigas y amigos residentes de la ciudad de Santa Fe, Argentina durante los últimos días de diciembre de 2021.

La misión de **La Cuentoneta** es construir colectivamente una plataforma accesible, amigable y gamificada que sea útil para fomentar, compartir y disfrutar la lectura digital. Buscamos lograrlo a través de la publicación de escritos breves en _storylists_ temáticas, emulando las playlists que utilizan plataformas de audio como Spotify y de video como YouTube; intentando resignificar el formato de antología de relatos breves.

---

## Índice de Contenidos

- [Hoja de ruta](#hoja-de-ruta)
- [Cómo contribuir](#cómo-contribuir)
- [Misión, Visión y Valores](#misión-visión-y-valores)
- [Comunidad](#comunidad)
- [Accesibilidad](#accesibilidad)
- [Contribuyentes](#contribuyentes)
- [Patrocinadores](#patrocinadores)
- [Staff](#staff)
- [Licencias](#licencias)
- [Links de interés](#links-de-interés)

## Hoja de ruta

Puedes acceder a la hoja de ruta (roadmap) del proyecto en [este enlace][doc-roadmap]. Allí podrás visualizar los planes de las futuras versiones de la plataforma más las storylists a agregar a La Cuentoneta.

## Cómo contribuir

Si deseas contribuir a La Cuentoneta te recomendamos leer la [guía de contribución][doc-contributing] para que puedas entender cómo puedes hacerlo. Allí encontrarás información sobre cómo reportar errores, proponer nuevas características, sugerir o sumar nuevos contenidos y cómo contribuir con código al proyecto.

En caso que seas desarrolladora o desarrollador, encontrarás en ese documento información sobre todos los aspectos
técnicos del proyecto, incluyendo cómo instalar el proyecto localmente para que puedas probarlo y realizar tus
contribuciones de código. También puedes acceder a la [documentación del proceso de desarrollo][doc-guia-de-desarrollo]
para interiorizarte sobre cómo gestionamos el desarrollo del
proyecto y decidimos sobre los aspectos prácticos y las herramientas que utilizamos para el mismo.

Si deseas visualizar los ítems de trabajo para principiantes en el proyecto, podés dirigirte a la [página de
contribución del proyecto](https://github.com/cuentoneta/cuentoneta/contribute).

### Agregar colores de TailwindCSS

El proyecto importa solo los colores de Tailwind que realmente usa para optimizar el _bundle_ y evitar _warnings_ de deprecación.
**Colores disponibles actualmente:** `zinc`, `blue`.
**Para agregar un nuevo color:**

1. Edita `src/app/providers/theme.service.ts`.
2. Agrega el color al import:
   ```typescript
   import { zinc, blue, red } from 'tailwindcss/colors';
   ```
3. Agrega el color al registro:
   ```typescript
   const AVAILABLE_COLORS = {
   	zinc,
   	blue,
   	red, // ← nuevo
   } as const;
   ```

**Uso:**

```typescript
constructor(private themeService: ThemeService) {}

const color = this.themeService.pickColor('red', 500);
// Devuelve: '#EF4444'
```

## Misión, Visión y Valores

La misión, la visión y los valores de La Cuentoneta nos proporcionan el marco de referencia para la toma de decisiones y el desarrollo de las acciones del proyecto a largo plazo. Pueden consultarse los MMVs encuentran en [este enlace][doc-mvv].

## Comunidad

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/78808163/198993731-299e973d-8f3b-4a6c-a445-b2b77e0b3286.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/78808163/228854353-cbd1f9b2-68a3-4cf0-851c-d2c49b3eb85c.svg">
  <img alt="logo-frontendcafe" src="https://user-images.githubusercontent.com/78808163/198993731-299e973d-8f3b-4a6c-a445-b2b77e0b3286.svg">
</picture>

Este proyecto se desarrolla con la participación y el apoyo de FrontendCafé. Es requerido unirte a nuestro [server][dc-fec] y buscar el canal [#🚐 | la-cuentoneta][dc-channel]. Allí vas a poder escribir consultas, realizar propuestas y compartir ideas para el proyecto. El código de conducta de este proyecto es extensible también a tu participación en el server de [FrontendCafé en Discord][dc-fec].

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://forgoodfirstissue.github.com/for-good-first-issue.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/cuentoneta/cuentoneta/assets/32349705/786d9201-e449-49a6-b9e2-ebf5f9281abc">
  <img alt="logo-frontendcafe" src="https://github.com/cuentoneta/cuentoneta/assets/32349705/786d9201-e449-49a6-b9e2-ebf5f9281abc">
</picture>

La Cuentoneta también es parte de [For Good First Issue](https://forgoodfirstissue.github.com/), una iniciativa que busca generar una lista curada de proyectos open-source con foco en desarrollos del tipo [Bienes Públicos Digitales (DPGs, Digital Public Goods)
](https://digitalpublicgoods.net/digital-public-goods/), los cuales además se encuentran disponibles para colaboración abierta.

<picture>
    <img height="96" width="96" alt="logo-tertulia-literaria" src="https://github.com/cuentoneta/cuentoneta/assets/32349705/7ca8a3d3-ed76-4785-a6ef-f3f7498b94c3">
</picture>

La comunidad [Tertulia Literaria](https://discord.gg/tertulia-literaria-795704695485235231), enfocada a compartir conocimiento, lecturas y en general la grata convivencia, colabora activamente con la selección de historias, la generación de iniciativas y la confección de storylists en La Cuentoneta.

---

## Accesibilidad

Quienes llevamos adelante este proyecto asumimos un compromiso a hacer todo lo posible por garantizar la accesibilidad digital en el uso de la plataforma, lo cual abarca e incluye a brindar facilidad de acceso para personas con discapacidades.
Para lograrlo, uno de los objetivos del proyecto es la mejora continua de la experiencia de usuario y el logro de aplicación de estándares de accesibilidad.

Las Pautas de Accesibilidad para el Contenido Web (WCAG) definen los requisitos para que diseñadores y desarrolladores mejoren la accesibilidad para las personas con discapacidades. Éste define tres niveles de conformidad: Nivel A, Nivel AA y Nivel AAA.

**En una primera etapa, los requerimientos a la hora de contribuir con este proyecto buscan cumplir los requisitos [WCAG 2.1 nivel A][wcag].**

> 💡 Si encontrás barreras de accesibilidad en la web de La Cuentoneta, podés informarlo enviando un email a [contacto@cuentoneta.ar][email] o abriendo un issue. Para hacerlo, necesitás leer la documentación sobre [cómo contribuir][doc-contributing].

---

## Contribuyentes

### Desarrolladores

- Ramiro Olivencia (**[@rolivencia](https://github.com/rolivencia)**)
- Erik Giovani (**[@erikgiovani](https://github.com/erikgiovani)**)
- Soledad Sasia (**[@SoleSasia](https://github.com/SoleSasia)**)
- Juan Blas Tschopp (**[@juanblas09](https://github.com/juanblas09)**)
- Diego Franchina (**[@soydiego](https://github.com/SoyDiego)**)
- Jimer Espinoza (**[@jimersamuel](https://github.com/JimerSamuel)**)
- Mia Ramos (**[@MiaPurpleFate](https://twitter.com.com/MiaPurpleFate)**)
- Wilson Lasso (**[@wilago](https://github.com/wilago)**)
- Gustavo Petruzzi (**[@gustavoPetruzzi](https://github.com/gustavoPetruzzi)**)
- Juan Romero (**[@Addin](https://github.com/Addin)**)
- Alexis Martínez (**[@AlexRGB2](https://github.com/AlexRGB2)**)
- John Angel (**[@Jeangel](https://github.com/Jeangel)**)
- Luciano Aieta (**[@lgaieta](https://github.com/lgaieta)**)

### Diseño UX/UI

- Maxi Cris (**[@maxicris](https://github.com/maxicris)**)

### Escritura de textos

- Sofía Abramovich
- Marian Erro (**[@marianerro](https://twitter.com/MarianaErro)**)
- Elk A. (**[@A-Elkkk-o-k](https://www.wattpad.com/user/A-Elkkk-o-k)**)

### Selección, Transcripción y Curación de contenido

- Patricio Decoud (**[@arroba_pato](https://twitter.com/arroba_pato)**)
- Juan Balmaceda (**[@balm4ceda](https://twitter.com/balm4ceda)**)
- Facundo Kaufmann (**[@FacuKaufmann](https://twitter.com/FacuKaufmann)**)
- Candela Godoy (**[@napsiex](https://twitter.com/napsiex)**)
- Analía Ale
- Brahian Pereyra (**[@brahianpdev](https://github.com/brahianpdev)**)
- Juan Romero (**[@juanr0mer0](https://twitter.com/juanr0mer0)**)
- Luis Omar Sánchez Díaz (**[@luisthepower](https://www.instagram.com/luisthepower/)**)
- Karla Nevárez (**[kanemu36@gmail.com](mailto:kanemu36@gmail.com)**)
- Sebastián Mansilla
- Lolo Diaz (**[@estre.sadx](https://instagram.com/estre.sadx)**)
- Nicolás Contrera (**[@nicontrera1](https://twitter.com/nicontrera1)**)

---

## Patrocinadores

¿Te interesa patrocinar o promocionar este proyecto? ¡Comunicate con nosotros!

---

## Staff

_Desarrollo y administración del repositorio_

Ramiro Olivencia (**[@rolivencia](https://github.com/rolivencia)**)

_Diseño UX/UI_

Maxi Cris (**[@maxicris](https://github.com/maxicris)**)

---

## Licencias

Este repositorio y el contenido de la web de La Cuentoneta se publican bajo licencia [Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)][doc-lic].

---

## Links de interés

- [La Cuentoneta][web]
- [FrontendCafé](https://frontend.cafe/)
- El presente documento toma como modelo el README.md del proyecto [Juguetear][github-juguetear], otra iniciativa en la que también participa [FrontendCafé][web-fec].

<!-- Listado de enlaces de referencia, mantenerlos actualizados en cada archivo -->
<!-- Enlaces a las paginas web del proyecto -->

[web]: https://cuentoneta.ar
[web-staging]: https://cuentoneta-staging.vercel.app
[web-storybook]: https://storybook-cuentoneta.vercel.app
[web-fec]: https://frontend.cafe/
[github-juguetear]: https://github.com/Juguetear/juguetear-web

<!-- Enlaces a otros documentos  -->

[doc-code_of_conduct]: CODE_OF_CONDUCT.md
[doc-changelog]: CHANGELOG.md
[doc-contributing]: CONTRIBUTING.md
[doc-roadmap]: ROADMAP.md
[doc-mvv]: MVV.md
[doc-lic]: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es
[doc-guia-de-desarrollo]: https://github.com/cuentoneta/cuentoneta/blob/develop/docs/DEVELOPMENT_GUIDE.md

<!-- Enlaces a Discord -->

[dc-channel]: https://discord.com/channels/594363964499165194/1109220285841944586
[dc-fec]: https://discord.com/invite/frontendcafe

<!-- Enlaces al repositorio en Github -->

[gh-issues]: https://github.com/rolivencia/cuentoneta/issues

<!-- Recursos y otros -->

[email]: mailto:contacto@cuentoneta.ar
[figma]: https://www.figma.com/file/BIlQ6U3eh3M8vtYQt3vLNW/La-Cuentoneta-v2
[wcag]: https://www.w3.org/WAI/standards-guidelines/wcag/es

<!-- Enlaces a Redes Sociales -->

[instagram-cuentoneta]: https://instagram.com/cuentoneta
[twitter-cuentoneta]: https://twitter.com/cuentoneta
[facebook-cuentoneta]: https://facebook.com/cuentoneta
