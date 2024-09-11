<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Guía de Desarrollo

¡Te damos la bienvenida! Ya que estás leyendo esta sección, te agradecemos querer involucrarte para contribuir en el
proyecto y conocer en profundidad cómo nos organizamos para su desarrollo.

En este documento encontrarás disponible información de naturaleza técnica y de gestión para saber cómo organizamos
el proyecto La Cuentoneta y cómo puedes contribuir al desarrollo del mismo.

Las prácticas de nuestro proceso de desarrollo, más las herramientas utilizadas para el desarrollo y la gestión del
mismo, están
abiertas a propuestas para mejoras, cambios y reemplazos. En caso de que desees aportar sugerencias o propuestas de mejorar el proceso de desarrollo, puedes hacerla el canal **[**#🚐 | la-cuentoneta**][dc-channel]** en Discord o en sumar un issue de tipo **[💼 Proponer mejoras en la Gestión o el Proceso de Desarrollo del Proyecto](https://github.com/cuentoneta/cuentoneta/issues/new/choose)**.

---

## Consideraciones Generales

La Cuentoneta es un proyecto abierto tanto en el código como en su gestión, siendo pública y de libre acceso toda la
información relacionada a su desarrollo y encontrándose la misma en línea con el [Código de Conducta](doc-code_of_conduct) y la declaración de [Misión, Visión y Valores](doc-mmv).

Dada la naturaleza del proyecto, es importante que tengas en consideración que:

- Procuramos simplicidad en la organización del proyecto y en la gestión del desarrollo, intentando incorporar
  herramientas y prácticas que permitan una experiencia de desarrollo (DX) óptima.
- El proyecto tiene objetivos claros, definidos y de largo plazo, por lo que es importante que las propuestas de mejoras o cambios en el proceso de desarrollo estén alineadas con los objetivos del proyecto.
- Existen herramientas más o menos arraigadas al proyecto, algunas de las cuales es complejo reemplazar. Para aquellas que revistan un cambio significativo, se deberá evaluar su impacto y viabilidad.
- Antes de proponer mejoras te familiarices con el proceso de desarrollo en su estado actual y en las herramientas que utilizamos.
- Tengas en cuenta que la disponibilidad de tiempo y recursos de quienes contribuyen al proyecto puede variar, sin
  dedicación a tiempo completo por parte de ninguno de los contribuyentes. Volveremos sobre este punto luego.

---

## Despliegues

El proyecto posee ambientes de despliegue para la aplicación web principal, más ambientes para el despliegue de
Storybook, donde se encuentran documentados los componentes web utilizados en el proyecto, y Sanity Studio, nuestro
gestor de contenido.

Los ambientes de despliegue son los siguientes:

- **Web | Producción:** [https://cuentoneta.ar/](https://cuentoneta.ar/)
- **Web | Staging:** [https://staging.cuentoneta.ar](https://staging.cuentoneta.ar)
- **Storybook:** [https://cuentoneta-storybook.vercel.app/](https://cuentoneta-storybook.vercel.app/)
- **Sanity Studio:** https://cuentoneta.sanity.studio/

---

## Tech Stack

El tech stack actualmente utilizado para el desarrollo de La Cuentoneta es:

### Para la gestión de la base de código del proyecto

- **<a href="https://git-scm.com/">Git</a>** como herramienta de control de versiones
- **<a href="https://https://github.com">GitHub</a>** como host de la base de código
- **<a href="https://pnpm.io/es/">pnpm</a>** como gestor de paquetes
- **<a href="https://nx.dev/angular">Nx</a>** como gestor de monorepo y task runner

Junto con Nx, el proyecto cuenta con ESLint y Prettier ya configuradas como dependencias.

### Para el desarrollo de la plataforma web

- **<a href="https://angular.io/">Angular 17</a>** como framework de frontend
- **<a href="https://angular.io/guide/universal">Angular Universal</a>** para Server-Side rendering
- **<a href="https://www.typescriptlang.org/">TypeScript</a>**
- **<a href="https://tailwindcss.com/docs/installation">Tailwind CSS</a>**
- **<a href="https://storybook.js.org/docs/react/get-started/introduction">Storybook</a>** como herramienta de desarrollo de componentes.

### Para la gestión del contenido

- **<a href="https://www.sanity.io/docs">Sanity</a>** para persistencia de información de cuentos, autores y storylists.

### Para pruebas unitarias y de integración

- **<a href="https://jestjs.io/docs/getting-started">Jest</a>** como framework de testing unitario
- **<a href="https://www.cypress.io/">Cypress</a>** como framework de testing end-to-end

### Para generación y visualización de diagramas

- **<a href="https://mermaid.js.org/">Mermaid</a>** como herramienta para la generación y visualización de diagramas dentro de archivos Markdown.

Para poder hacer uso de las funcionalidades de Mermaid dentro del entorno de trabajo local, es necesario contar con una extensión para el IDE o editor de texto que se esté utilizando.

- En el caso de Visual Studio Code, se recomienda la extensión [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid).
- En el caso de WebStorm, se recomienda la extensión [Markdown Mermaid](https://plugins.jetbrains.com/plugin/20146-mermaid/), la cual requiere la instalación previa de la extensión [Markdown](https://plugins.jetbrains.com/plugin/7793-markdown). Para el caso de WebStorm, se detalla que ambos plugins son oficiales de Jetbrains.

Para la edición y visualización online de los diagramas también puede optarse por utilizar el [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/), en el cual pueden copiarse y pegarse los diagramas disponibles en nuestro repositorio para su visualización y modificación.

---

## Instalación y configuración del entorno local

En esta sección se detallan los pasos necesarios para instalar y configurar el entorno de desarrollo local del
proyecto. En caso de que tengas alguna duda o inconveniente durante la instalación, recuerda que puedes escribir
en el canal **[#🚐 | la-cuentoneta][dc-channel]** en Discord.

### Requerimientos

- Tener instalada una versión de [Node](https://nodejs.org/es/) igual o superior a `v20.11.0`, idealmente la última
  versión LTS.
- Instalar `pnpm`, un gestor de paquetes alternativo para Node: `npm install -g pnpm`. Se recomienda la versión `9.8.0` o superior.
- Instalar `nx`, un CLI para desarrollo de monorepos: `pnpm install -g nx`. Se recomienda la versión `19.0.0` o
  superior.
- Tener un editor de texto o IDE ([Visual Studio Code](https://code.visualstudio.com/), [Vim](https://www.vim.org/), [WebStorm](https://www.jetbrains.com/es-es/webstorm/), etc).
- Tener una cuenta en [GitHub](https://docs.github.com/es/get-started/signing-up-for-github/signing-up-for-a-new-github-account).
- Leer y seguir el [código de conducta][doc-code_of_conduct].
- Unirte a [FrontendCafé][dc-fec] en Discord.

---

### Clonar el repositorio

#### Paso 1: Generar un _fork_ del repositorio

Para poder trabajar localmente en el proyecto, y luego contribuir tus cambios, deberás realizar un fork del repositorio desde GitHub y clonarlo en tu computadora.

El fork del repositorio se realiza desde el botón `Fork` en la esquina superior derecha de la página del repositorio en GitHub. Una vez clickeado el botón, podrás visualizar la siguiente pantalla.

![image](https://github.com/cuentoneta/cuentoneta/assets/32349705/3f7ff9cf-6b06-4265-a940-a455f6cd753a)

Luego de pulsar el botón `Create fork`, se creará una copia del repositorio en tu cuenta de GitHub, desde la que podrás trabajar localmente en el proyecto, generar tus commits y posteriormente crear pull requests al repositorio original.

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

O bien, su versión corta.

```bash
pnpm i
```

### Paso 3: Buildear el servidor

```bash
pnpm run build
```

#### Paso 4: Correr el entorno de desarrollo localmente

Una vez hechos los pasos de instalación ejecutá el siguiente comando:

```bash
pnpm run dev
```

Se iniciara el servidor de desarrollo, visitá [http://localhost:4200](http://localhost:4200) en tu navegador para ver la aplicación.

Para ejecutar el entorno de desarrollo de Sanity Studio, ejecutá el siguiente comando, posándote en el directorio `cms`:

```bash
pnpm run dev
```

---

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

Acceder con este usuario te permitirá crear y editar documentos en el entorno de desarrollo de Sanity Studio con el rol de _Contributor_, el cual tiene permisos para crear y editar documentos, pero no para publicarlos. De esta manera podrás introducir modificaciones locales en los schemas de Sanity y agregar documentos en formato draft para evaluar tus cambios.

---

## Pautas de Desarrollo

### Control de versiones

El proyecto utiliza [git](https://git-scm.com) como herramienta de control de versiones y Github para alojar el código fuente y gestionar el versionado y las contribuciones de código. Dentro del repositorio se hace uso de dos ramas particulares para el desarrollo del proyecto:`master` y `develop`, agregando ramas de trabajo adicionales para la implementación de nuevas funcionalidades y corrección de errores, generándose nuevas ramas por cada incidencia trabajada, sea esta incidencia de naturaleza de mejora, corrección de errores, documentación u otra naturaleza.

### Organización del repositorio

- El proyecto posee una [organización en Github](https://github.com/cuentoneta) donde se encuentran los repositorios del proyecto, siendo todos estos
  repositorios públicos y de libre acceso.
- La rama `master` es la rama principal del proyecto. En ella se integran los cambios que hacen a las versiones estables del proyecto y a partir de la cual se despliega el ambiente de producción.
- La rama `develop` es la rama de desarrollo, donde se integran los cambios de las ramas de trabajo y a partir de la
  cual se despliega el ambiente de _staging_.
- Las contribuciones de código al proyecto se realizan mediante **pull requests** enviadas por medio de Github, las cuales permiten las _code reviews_ por parte de los mantenedores del proyecto y la posterior integración de estos cambios en la rama `develop`.

### Consideraciones al contribuir al repositorio

- En caso de que seas un colaborador externo debes escribir un mensaje en la issue en el que desees trabajar, a fin de que te pueda ser asignado.
- Aplica también para colaboradores externos la necesidad de realizar un _fork_ del repositorio para así posteriormente envar tus cambios mediante un _pull request_ desde tu _fork_ al repositorio principal. Para generar un _fork_, sigue los pasos detallados en la sección [Clonar el repositorio](#clonar-el-repositorio).
- En caso de que seas un colaborador externo, debes de dejar un mensaje en el issue que quieras tomar para que te lo puedan asignar, después es necesario que realices un _fork_ del repositorio y envíes tus
  cambios mediante un _pull request_ desde tu _fork_ al repositorio principal, generando el fork tal como se detalla
  en la sección previa [Clonar el repositorio](#clonar-el-repositorio).
- Las ramas de trabajo se nomenclan de la siguiente manera: `<numero-de-incidencia>-<nombre-de-la-funcionalidad>`.
  Por ejemplo: `469-implementar-nuevo-componente-story-card-component`. Para facilidad de la generación de las ramas
  de trabajo, se recomienda hacer uso de la generación de ramas a partir de las incidencias de Github.
- Todos los commits deben ser nomenclados de la siguiente manera, referenciando el commit de manera navegable desde
  la interfaz de Github: `[#numero-de-incidencia] - 
<mensaje-del-commit>`. Por ejemplo: `[#469] - Crear componente PublicationCardComponent`.
- Las ramas de trabajo se crean a partir de la rama `develop` y se eliminan una vez integrados los cambios en la rama `develop`.
- Las ramas de trabajo deben ser actualizadas con la rama `develop` antes de solicitar la integración de los cambios en la rama `develop`.
- El código escrito en en el proyecto sigue las convenciones de [Angular](https://runebook.dev/es/docs/angular/guide/styleguide), [TypeScript](https://ts.dev/style/) y [RxJS](https://v10.angular.io/guide/rx-library#naming-conventions-for-observables) correspondientes para la escritura de código.

### Gestión de versiones

Se desplegarán nuevas versiones de producción del proyecto siguiendo el [versionado semántico](https://semver.org/), donde se incrementará la versión de acuerdo a los siguientes criterios:

- **Parche**: Incremento de la versión cuando se realizan correcciones de errores, agregados de documentación o modificaciones que alteran sólo la experiencia de desarrollo (DX) del proyecto.
- **Menor**: Incremento de la versión cuando se agregan nuevas funcionalidades de forma retrocompatible.
- **Mayor**: Incremento de la versión cuando se realizan cambios que no son retrocompatibles.

El lanzamiento de una nueva versión viene acompañado de la actualización de la documentación y la generación de un _tag_ en un commit específico del repositorio de Github, el cual señala el punto de lanzamiento de la nueva versión.

Para la generación de los _tags_ de versionado se utilizará la siguiente nomenclatura: `vX.Y.Z`, donde `X` es el número de versión mayor, `Y` el número de versión menor y `Z` el número de versión de parche.

El trabajo asociado a una versión particular se encuentra agrupado en un _[hito (milestone)](https://github.com/cuentoneta/cuentoneta/milestones)_ de Github, el cual contiene las incidencias y las ramas de trabajo que se encuentran en desarrollo asociadas a la versión.

Para dar por cerrado un _hito_ debe cumplirse con los siguientes criterios:

- Todas las incidencias asociadas al _hito_ deben encontrarse cerradas.
- Todas las ramas de trabajo asociadas al _hito_ deben haber sido integradas en la rama `develop`.
- La documentación asociada al _hito_ debe encontrarse actualizada.
- La versión debe haber sido lanzada y el _tag_ correspondiente creado.
- El _hito_ debe encontrarse marcado como cerrado en Github.
- Debe crearse un último issue de tipo `💼 Preparar lanzamiento de una nueva versión`, el cual oficia de checklist para el lanzamiento de la nueva versión y detalla todos estos pasos.

### Gestión de incidencias

La gestión de incidencias, también referidas como issues, tickets o ítems de trabajo, se realiza a través de Github,
utilizando la sección _Issues_ del repositorio del proyecto. Cualquier persona, miembro del equipo o externa al
mismo, puede abrir una incidencia en el proyecto, teniendo que obligadamente elegir un tipo de incidencia y
completar un formulario con la información necesaria para completar la carga.

Luego de creada la incidencia, el equipo de desarrollo procederá a realizar un análisis y _triaging_ de la misma.
Luego se procederá a evaluar la prioridad y la complejidad de la incidencia, siendo ésta luego asignada a un
colaborador, interno o externo, para su resolución.

Aquellas incidencias que requieran trabajo de desarrollo estarán asociadas a una o más ramas de trabajo, las cuales se
recomienda sean creadas a partir de la incidencia en la interfaz de Github, siguiendo los lineamientos de la sección
[Gestión de versiones](#gestión-de-versiones). Dentro de las ramas creadas se realizará el trabajo de desarrollo,
solicitando posteriormente la integración de los cambios en la rama `develop` mediante un _pull request_.

#### Etiquetas

Las incidencias se clasifican utilizando etiquetas, las cuales permiten identificar rápidamente el tipo de
incidencia según su naturaleza, área de interés, complejidad y prioridad. Algunas etiquetas son asignadas a las
incidencias en
base a
la plantilla seleccionada al momento de su creación, mientras que otras son asignadas por los gestores del proyecto
a la hora de realizar el _triaging_ y análisis de la incidencia.

---

[dc-channel]: https://discord.com/channels/594363964499165194/1109220285841944586
[github-issues-tutorial]: https://docs.github.com/es/issues/tracking-your-work-with-issues/creating-an-issue
[crear-issue-cuentoneta]: https://github.com/rolivencia/cuentoneta/issues/new/choose
[feature-request-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%8F%8E%EF%B8%8F+mejora&projects=&template=feature.yml
[bug-report-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%A6%9F+bug&projects=&template=bug_report.yml

<!-- Enlaces a otros documentos -->

[doc-mvv]: https://github.com/cuentoneta/cuentoneta/blob/develop/MVV.md
[doc-code_of_conduct]: https://github.com/cuentoneta/cuentoneta/blob/develop/CODE_OF_CONDUCT.md
[dc-fec]: https://discord.com/invite/frontendcafe
