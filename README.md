<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---
**La Cuentoneta** es un proyecto abierto y sin fines de lucro que busca generar un espacio comunitario para difundir literatura en formato de relatos breves, gestado originalmente por un grupo de amigues residentes de la ciudad de **Santa Fe, Argentina 🇦🇷** .

La misión de **La Cuentoneta** es construir colectivamente una plataforma accesible, amigable y gamificada que sea útil para fomentar, compartir y disfrutar la lectura digital a través de la publicación de relatos breves en storylists temáticas, emulando las playlists musicales o de videos que utilizan plataformas de audio como Spotify y de video como YouTube.

---
## Índice de Contenidos
- [Cómo contribuir](#cómo-contribuir)
- [Misión, Visión y Valores](#misión-visión-y-valores)
- [Hoja de Ruta](#hoja-de-ruta)
- [Comunidad](#comunidad)
- [Requerimientos](#requerimientos)
- [Despliegues](#despliegues)
- [Diseño de interfaz (UI/UX)](#diseño-de-interfaz-uiux)
- [Accesibilidad](#accesibilidad)
- [Tech Stack](#tech-stack)
- [Correr el proyecto localmente](#correr-el-proyecto-localmente)
- [Contribuyentes](#contribuyentes)
- [Patrocinadores](#patrocinadores)
- [Staff](#staff)
- [Licencias](#licencias)
- [Links de interés](#links-de-interés)
--- 

## Cómo contribuir
## Misión, Visión y Valores
## Hoja de Ruta

## Comunidad

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/78808163/198993731-299e973d-8f3b-4a6c-a445-b2b77e0b3286.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/78808163/228854353-cbd1f9b2-68a3-4cf0-851c-d2c49b3eb85c.svg">
  <img alt="logo-frontendcafe" src="https://user-images.githubusercontent.com/78808163/198993731-299e973d-8f3b-4a6c-a445-b2b77e0b3286.svg">
</picture>

Este proyecto se desarrolla con la participación y el apoyo de FrontendCafé. Es requerido unirte a nuestro [server][dc-fec] y buscar el canal [#🚐 | la-cuentoneta][dc-channel]. Ahí vas a poder compartir dudas e ideas del proyecto. El código de conducta de este proyecto es extensible también a tu participación en el server de FrontendCafé en Discord.

---

## Requerimientos

- Tener instalada una versión de [Node](https://nodejs.org/es/) superior a `v16.16.0`, idealmente la última versión LTS.
- Instalar `pnpm`, un gestor de paquetes alternativo para Node: `npm install -g pnpm`. Se recomienda la versión `8.2.0` o superior.
- Tener un editor de texto o IDE ([Visual Studio Code](https://code.visualstudio.com/), [Vim](https://www.vim.org/), etc.)
- Tener una cuenta en [GitHub](https://docs.github.com/es/get-started/signing-up-for-github/signing-up-for-a-new-github-account)
- Leer y seguir [Código de Conducta][doc-code_of_conduct]
- Unirte a [FrontendCafé][dc-fec] en Discord

## Despliegues

- **Web | Producción:** [https://cuentoneta.ar/](https://cuentoneta.ar/)
- **Web | Staging:** (próximamente)
- **Storybook:** (próximamente)
- **Sanity Studio:** (próximamente)

## Diseño de interfaz (UI/UX)

El diseño de interfaz de usuario de La Cuentoneta ha sido desarrollado por [Maxi Cris](https://maxicris.com/).  
Puedes acceder a [**este enlace**][figma] para ver los diseño de la web y todos los recursos gráficos del proyecto.

> 💡 Cualquier duda, feedback o sugerencia podés compartirla en el canal [#🚐 | la-cuentoneta][dc-channel] del server de [FrontendCafé][dc-fec] en Discord.

---
## Accesibilidad

Quienes llevamos adelante este proyecto asumimos un compromiso a hacer todo lo posible por garantizar la accesibilidad digital en el uso de la plataforma, lo cual abarca e incluye a brindar facilidad de acceso para personas con discapacidades. 
Para lograrlo, uno de los objetivos del proyecto es la mejora continua de la experiencia de usuario y el logro de aplicación de estándares de accesibilidad.

Las Pautas de Accesibilidad para el Contenido Web (WCAG) definen los requisitos para que les diseñadores y desarrolladores mejoren la accesibilidad para las personas con discapacidades. Éste define tres niveles de conformidad: Nivel A, Nivel AA y Nivel AAA.

**En una primera etapa, los requerimientos a la hora de contribuir con este proyecto buscan cumplir los requisitos [WCAG 2.1 nivel A][wcag].**

> 💡 Si encontrás barreras de accesibilidad en la web de La Cuentoneta, podés informarlo enviando un email a [contacto@cuentoneta.ar][email] o abriendo un issue. Para hacerlo, necesitás leer la documentación sobre [cómo contribuir][doc-contributing].

## Tech Stack

El tech stack actualmente utilizado para el desarrollo de La Cuentoneta es:

#### Para la gestión de la base de código del proyecto
- **<a href="https://git-scm.com/">Git</a>** como herramienta de control de versiones
- **<a href="https://https://github.com">GitHub</a>** como host de la base de código
- **<a href="https://pnpm.io/es/">pnpm</a>** como gestor de paquetes
- **<a href="https://nx.dev/angular">Nx</a>** como gestor de monorepo y task runner

Junto con Nx, el proyecto cuenta con ESLint y Prettier ya configuradas como dependencias.

#### Para el desarrollo de la plataforma web
- **<a href="https://angular.io/">Angular 16</a>** como framework de frontend
- **<a href="https://angular.io/guide/universal">Angular Universal</a>** para Server-Side rendering
- **<a href="https://www.typescriptlang.org/">TypeScript</a>**
- **<a href="https://tailwindcss.com/docs/installation">Tailwind CSS</a>**
- **<a href="https://storybook.js.org/docs/react/get-started/introduction">Storybook</a>** como herramienta de desarrollo de componentes.

#### Para la gestión del contenido
- **<a href="https://www.sanity.io/docs">Sanity</a>** para persistencia de información de cuentos, autores y storylists.

#### Para pruebas unitarias y de integración
- **<a href="https://jestjs.io/docs/getting-started">Jest</a>** como framework de testing unitario
- **<a href="https://www.cypress.io/">Cypress</a>** como framework de testing end-to-end

> 💡 No hace falta tener mucho conocimiento en el tech stack para poder contribuir en el desarrollo. Si tienes ganas de aprender, ¡te invitamos a sumarte!

## Correr el proyecto localmente

### Instalación
Ubícate en la carpeta donde deseas instalar el proyecto y clona el repositorio ejecutando:

```bash
git clone https://github.com/rolivencia/cuentoneta.git
cd cuentoneta
```

Posteriormente ejecutá el siguiente comando para instalar todas las dependencias listadas en el archivo [`package.json`](package.json).
```bash
pnpm install
```

### Correr el entorno de desarrollo localmente
Una vez hechos los pasos de instalación ejecutá el siguiente comando:
```bash
pnpm run vercel:dev
```
Se iniciara el servidor de desarrollo, visitá [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

Para ejecutar el entorno de desarrollo de Sanity Studio, ejecutá el siguiente comando, posándote en el directorio `cms`:
```bash
pnpm run dev
```

## Contribuyentes
### Desarrolladores
<a href="https://github.com/rolivencia/cuentoneta/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=rolivencia/cuentoneta" />
</a>

Gráfico generado vía [contrib.rocks](https://contrib.rocks).

### Diseño UX/UI
Maxi Cris (**[@maxicris](https://github.com/maxicris)**)

### Escritura de textos
* Sofía Abramovich

### Selección, Transcripción y Curación de contenido
* Patricio Decoud
* Juan Balmaceda
* Facundo Kaufmann
* Candela Godoy
* Analía Ale
* Brahian Pereyra (**[@brahianpdev](https://github.com/brahianpdev)**)

## Patrocinadores
¿Te interesa patrocinar o promocionar este proyecto? ¡Comunícate con nosotros!
## Staff
_Desarrollo y administración del repositorio_

Ramiro Olivencia (**[@rolivencia](https://github.com/rolivencia)**)

_Diseño UX/UI_

Maxi Cris (**[@maxicris](https://github.com/maxicris)**)

## Licencias
Este repositorio y el contenido de la web de La Cuentoneta se publican bajo licencia [Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)][doc-lic].

## Links de interés
- [La Cuentoneta][web]
- [FrontendCafé](https://frontend.cafe/)
- El presente documento toma como modelo el README.md del proyecto [Juguetear][github-juguetear], otra iniciativa en la que participa [FrontendCafé][web-fec]. 

<!-- Listado de enlaces de referencia, mantenerlos actualizados en cada archivo -->
<!-- Enlaces a las paginas web del proyecto -->
[web]: https://cuentoneta.ar
[web-staging]: https://cuentoneta-staging.vercel.app
[web-storybook]: https://storybook-cuentoneta.vercel.app
[web-fec]: https://frontend.cafe/
[github-juguetear]: https://github.com/Juguetear/juguetear-web

<!-- Enlaces a archivos de documentación (propios al repositorio)  -->
[doc-code_of_conduct]: CODE_OF_CONDUCT.md
[doc-changelog]: CHANGELOG.md
[doc-contributing]: CONTRIBUTING.md
[doc-roadmap]: ROADMAP.md
[doc-mmv]: MVV.md
[doc-lic]: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es

<!-- Enlaces a Discord -->
[dc-channel]: https://discord.com/channels/594363964499165194/1109220285841944586
[dc-fec]: https://discord.com/invite/frontendcafe

<!-- Enlaces al repositorio en Github -->
[gh-issues]: https://github.com/rolivencia/cuentoneta/issues

<!-- Recursos y otros -->
[email]: mailto:contacto@cuentoneta.ar
[figma]: https://www.figma.com/file/BIlQ6U3eh3M8vtYQt3vLNW/La-Cuentoneta-v2
[wcag]: https://www.w3.org/WAI/standards-guidelines/wcag/es
