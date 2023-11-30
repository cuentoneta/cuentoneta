<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# ¿Cómo contribuir a La Cuentoneta?

En este documento encontrarás disponible información sobre cómo contribuir al desarrollo y la generación de
contenido de La Cuentoneta.

Utilizamos [Github Issues][github-issues-tutorial] para llevar adelante el seguimiento de reportes de bugs
(_bug reports_), la propuesta de nuevas funcionalidades y mejoras (_feature requests_) y la contribución y
sugerencia de contenidos para sumar a la plataforma.

En la [sección de creación de nuevos issues][crear-issue-cuentoneta] del proyecto pueden agregarse nuevos issues en base a las plantillas que el equipo ha definido.

También puede visualizarse la [lista de issues creados](https://github.com/rolivencia/cuentoneta/issues). Esta lista se actualiza y cura por parte de quienes contribuyen a La Cuentoneta, filtrando, clasificando y detallando lo escrito en cada uno de los issues en los que se trabajará a futuro.

> 💡 Si tienes alguna consulta, puedes hacerla en nuestro canal [**#🚐 | la-cuentoneta**][dc-channel] en Discord.

> ⚠️ Recordá, antes de contribuir, que es **requerido** que seas parte del [**servidor de FrontendCafé**][dc-fec] en Discord.

## Tipos de Contribuciones

Puedes sumar tu granito de arena al desarrollo de La Cuentoneta de varias formas, algunas de las cuales se describen a continuación. Como agradecimiento por tu aporte te incluiremos en la sección de [contribuyentes][contribuyentes] del sitio web y podrás, además, portar el badge `Cuentoneta 🚐` en el servidor de [Discord de FrontendCafé][dc-channel].

Si tienes cualquier tipo de dudas respecto de cómo contribuir al proyecto, no dudes en escribirnos a nuestro canal en el [Discord de FrontendCafé][dc-channel] o vía mail a [contacto@cuentoneta.ar][email] para ponernos en contacto y discutir tu propuesta.

### 📢 Difundiendo

Si te gusta el proyecto, puedes ayudarnos difundiéndolo en tus redes sociales, compartiendo los contenidos que publicamos, y recomendándolo a otras personas.
Llegar cada vez a más personas hará que podamos mejorar la plataforma y descubrir qué funcionalidades nuevas son más necesarias a futuro.
La Cuentoneta tiene cuentas oficiales en [Facebook][facebook-cuentoneta], [Instagram][instagram-cuentoneta] y [Twitter][twitter-cuentoneta].

### 📜 Contenidos

Puedes sugerir contenido para sumar a la plataforma, sea en forma de cuentos, poemas, ensayos o temáticas para nuevas storylists.
El contenido puede ser escritura propia o de terceros, con previos permisos de publicación o disponibilidad de acceso a este contenido en la web abierta.

Estamos trabajando para, a futuro, ir en busca de autores y autoras de cuentos y poemas de autoría original que deseen publicar sus obras en La Cuentoneta.

### 🦟 Reportando problemas y/o errores

En caso de encontrar un error o problema en la plataforma, puedes [crear un issue][crear-issue-cuentoneta] en este repositorio para que podamos arreglarlo cuanto antes y solucionar el problema. Para ello, puedes puees sumar un issue del tipo [_reportar un problema/error_][bug-report-template].

### 💡 Sugiriendo nuevas funcionalidades

Para proponer una nueva funcionalidad o característica, puedes sumarla en este repositorio para que podamos discutirla y agregarla a la hoja de ruta del proyecto, sumando un issue de tipo [_propuesta de nueva funcionalidad_][feature-request-template].

### 🎨 Diseño UX/UI

Si tienes habilidades en diseño UX/UI, podés contribuir al proyecto asistiendo en la creación de wireframes, mockups, y prototipos para mejorar características existentes de la plataforma y contribuir en la gestación de nuevas funcionalidades.

El diseño original de interfaz de usuario de La Cuentoneta ha sido desarrollado íntegramente por [Maxi Cris](https://maxicris.com/). Puedes acceder a [este enlace de Figma][figma] para ver los diseño de la web y todos los recursos gráficos del proyecto.

### 🖥️ Contribuyendo código

Si eres desarrolladora o desarrollador, puedes contribuir al proyecto mediante la creación de issues, pull requests, revisando código y más en este repositorio. Para ello, te recomendamos leer la sección [guía de contribución de código](#aspectos-técnicos-y-guía-de-contribución-de-código) para que puedas familiarizarte con el proyecto y sus convenciones.

## Aspectos técnicos y guía de contribución de código

En esta sección encontrarás información sobre todo lo que respecta al aspecto técnico de desarrollo de software de La Cuentoneta. Se incluye información sobre:

- El tech stack utilizado para el desarrollo de la plataforma web.
- Instrucciones sobre cómo instalar una versión local del proyecto
- La especificación de alto nivel del proceso de desarrollo de software adoptado por el equipo, el cual incluye procedimientos y convenciones.

---

### Tech Stack

El tech stack actualmente utilizado para el desarrollo de La Cuentoneta es:

#### Para la gestión de la base de código del proyecto

- **<a href="https://git-scm.com/">Git</a>** como herramienta de control de versiones
- **<a href="https://https://github.com">GitHub</a>** como host de la base de código
- **<a href="https://pnpm.io/es/">pnpm</a>** como gestor de paquetes
- **<a href="https://nx.dev/angular">Nx</a>** como gestor de monorepo y task runner

Junto con Nx, el proyecto cuenta con ESLint y Prettier ya configuradas como dependencias.

#### Para el desarrollo de la plataforma web

- **<a href="https://angular.io/">Angular 17</a>** como framework de frontend
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

---

### Requerimientos

- Tener instalada una versión de [Node](https://nodejs.org/es/) igual o superior a `v18.15.0`, idealmente la última versión LTS.
- Instalar `pnpm`, un gestor de paquetes alternativo para Node: `npm install -g pnpm`. Se recomienda la versión `8.2.0` o superior.
- Instalar `nx`, un CLI para desarrollo de monorepos: `pnpm install -g nx`. Se recomienda la versión `17.1.0` o superior.
- Tener un editor de texto o IDE ([Visual Studio Code](https://code.visualstudio.com/), [Vim](https://www.vim.org/), [WebStorm](https://www.jetbrains.com/es-es/webstorm/), etc.)
- Tener una cuenta en [GitHub](https://docs.github.com/es/get-started/signing-up-for-github/signing-up-for-a-new-github-account)
- Leer y seguir [Código de Conducta][doc-code_of_conduct].
- Unirte a [FrontendCafé][dc-fec] en Discord.

---

### Clonar el repositorio

#### Paso 1: _Forkear_ el repositorio

Para poder trabajar localmente en el proyecto, y luego contribuir tus cambios, deberás realizar un fork del repositorio desde Github y clonarlo en tu computadora.

El fork del repositorio se realiza desde el botón `Fork` en la esquina superior derecha de la página del repositorio en Github. Una vez clickeado el botón, podrás visualizar la siguiente pantalla.

![image](https://github.com/rolivencia/cuentoneta/assets/32349705/9cef7034-ddf7-4ee3-934c-684c4e698386)

Luego de pulsar el botón `Create fork`, se creará una copia del repositorio en tu cuenta de Github, desde la que podrás trabajar localmente en el proyecto, generar tus commits y posteriormente crear pull requests al repositorio original.

#### Paso 2: Clonar el repositorio

Luego de hacer fork del repositorio, debes clonar el repositorio en tu computadora:

```bash
git clone https://github.com/<tu_nombre_de_usuario_en_github>/cuentoneta.git
cd cuentoneta
```

Deberás luego crear un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```bash
SANITY_STUDIO_DATASET=development
SANITY_STUDIO_PROJECT_ID=s4dbqkc5
CUENTONETA_WEBSITE=https://cuentoneta.ar/
```

Posteriormente ejecuta el siguiente comando para instalar todas las dependencias listadas en el archivo [`package.json`](package.json).

```bash
pnpm install
```

#### Paso 3: Correr el entorno de desarrollo localmente

Una vez hechos los pasos de instalación ejecutá el siguiente comando:

```bash
pnpm run dev
```

Se iniciara el servidor de desarrollo, visitá [http://localhost:4200](http://localhost:4200) en tu navegador para ver la aplicación.

Para ejecutar el entorno de desarrollo de Sanity Studio, ejecutá el siguiente comando, posándote en el directorio `cms`:

```bash
pnpm run dev
```
----
### Correr localmente Sanity Studio
Para gestionar el contenido de La Cuentoneta utilizamos [Sanity Studio](https://www.sanity.io/docs/sanity-studio). Puedes ejecutar localmente en tu computadora el entorno de desarrollo de Sanity Studio, en modo sólo lectura, siguiendo los siguientes pasos:

#### Paso 1: Instalar dependencias

Ejecutá el siguiente comando, posándote en el directorio `/cms`:

```bash
pnpm install
```

#### Paso 2: Configurar archivo .env

Deberás agregar un archivo `.env` en la carpeta `/cms`.

El contenido del archivo `.env` deberá ser el siguiente:
```
SANITY_STUDIO_DATASET=development
SANITY_STUDIO_PROJECT_ID=s4dbqkc5
```

#### Paso 3: Ejecutar el entorno de desarrollo

En el mismo directorio, ejecutá el siguiente comando:

```bash
pnpm sanity dev
```

#### Paso 4: Credenciales

La primera vez que ejecutes el entorno de desarrollo de Sanity Studio, se te pedirá que ingreses tus credenciales de acceso. Deberás elegir la opción `Email` y luego ingresar las siguientes credenciales:

```
Usuario: dev@cuentoneta.ar
Password: CuentonetaFec2023#
```

#### Paso 5: ¡Listo!
Luego de ingresar las credenciales, se abrirá una pestaña en tu navegador con el entorno de desarrollo de Sanity Studio en la URL: https://localhost:3333

---

### Despliegues

Los ambientes de despliegue de La Cuentoneta son los siguientes:

- **Web | Producción:** [https://cuentoneta.ar/](https://cuentoneta.ar/)
- **Web | Staging:** [https://staging.cuentoneta.ar](https://staging.cuentoneta.ar)
- **Storybook:** [https://cuentoneta-storybook.vercel.app/](https://cuentoneta-storybook.vercel.app/)
- **Sanity Studio | Development:** (próximamente)
  <!-- Links a Github issues y a issue templates -->
  [github-issues-tutorial]: https://docs.github.com/es/issues/tracking-your-work-with-issues/creating-an-issue
  [crear-issue-cuentoneta]: https://github.com/rolivencia/cuentoneta/issues/new/choose
  [feature-request-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%8F%8E%EF%B8%8F+mejora&projects=&template=feature.yml
  [bug-report-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%A6%9F+bug&projects=&template=bug_report.yml

<!-- Enlaces a Discord -->

[dc-channel]: https://discord.com/channels/594363964499165194/1109220285841944586
[dc-fec]: https://discord.com/invite/frontendcafe
[contribuyentes]: https://www.cuentoneta.ar/about#people

<!-- Recursos y otros -->

[email]: mailto:contacto@cuentoneta.ar
[figma]: https://www.figma.com/file/BIlQ6U3eh3M8vtYQt3vLNW/La-Cuentoneta-v2
[wcag]: https://www.w3.org/WAI/standards-guidelines/wcag/es
[instagram-cuentoneta]: https://instagram.com/cuentoneta
[twitter-cuentoneta]: https://twitter.com/cuentoneta
[facebook-cuentoneta]: https://facebook.com/lacuentoneta
