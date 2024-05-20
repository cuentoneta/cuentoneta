<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Proceso de Desarrollo

¡Te damos la bienvenida! Ya que estás leyendo esta sección, te agradecemos querer involucrarte en el proyecto y conocer en profundidad cómo nos organizamos para su desarrollo.

Las prácticas de nuestro proceso de desarrollo, más las herramientas utilizadas para la gestión del mismo, están
abiertas a propuestas para mejoras, cambios y reemplazos. En caso de que desees aportar sugerencias o propuestas de mejorar el proceso de desarrollo, puedes hacerla el canal **[**#🚐 | la-cuentoneta**][dc-channel]** en Discord o en sumar un issue de tipo **[💼 Proponer mejoras en la Gestión o el Proceso de Desarrollo del Proyecto](https://github.com/cuentoneta/cuentoneta/issues/new/choose)**.

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

## Pautas de Desarrollo

### Control de versiones

El proyecto utiliza [git](https://git-scm.com) como herramienta de control de versiones y Github para alojar el código fuente y gestionar el versionado y las contribuciones de código. Dentro del repositorio se hace uso de dos ramas particulares para el desarrollo del proyecto:`master` y `develop`, agregando ramas de trabajo adicionales para la implementación de nuevas funcionalidades y corrección de errores, generándose nuevas ramas por cada incidencia trabajada, sea esta incidencia de naturaleza de mejora, corrección de errores, documentación u otra naturaleza.

#### Consideraciones

- El proyecto posee una [organización en Github](https://github.com/cuentoneta) donde se encuentran los repositorios del proyecto, siendo todos estos
  repositorios públicos y de libre acceso.
- La rama `master` es la rama principal del proyecto. En ella se integran los cambios que hacen a las versiones estables del proyecto y a partir de la cual se despliega el ambiente de producción.
- La rama `develop` es la rama de desarrollo, donde se integran los cambios de las ramas de trabajo y a partir de la
  cual se despliega el ambiente de _staging_.
- Las contribuciones de código al proyecto se realizan mediante **pull requests** enviadas por medio de Github, las cuales permiten las _code reviews_ por parte de los mantenedores del proyecto y la posterior integración de estos cambios en la rama `develop`.
- Las ramas de trabajo se nomenclan de la siguiente manera: `<numero-de-incidencia>-<nombre-de-la-funcionalidad>`.
  Por ejemplo: `469-implementar-nuevo-componente-story-card-component`. Para facilidad de la generación de las ramas
  de trabajo, se recomienda hacer uso de la generación de ramas a partir de las incidencias de Github.
- Todos los commits deben ser nomenclados de la siguiente manera, referenciando el commit de manera navegable desde
  la interfaz de Github: `[#numero-de-incidencia] - 
<mensaje-del-commit>`. Por ejemplo: `[#469] - Crear componente StoryCardComponent`.
- Las ramas de trabajo se crean a partir de la rama `develop` y se eliminan una vez integrados los cambios en la rama `develop`.
- Las ramas de trabajo deben ser actualizadas con la rama `develop` antes de solicitar la integración de los cambios en la rama `develop`.

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

[... POR COMPLETAR]

---

[dc-channel]: https://discord.com/channels/594363964499165194/1109220285841944586
[github-issues-tutorial]: https://docs.github.com/es/issues/tracking-your-work-with-issues/creating-an-issue
[crear-issue-cuentoneta]: https://github.com/rolivencia/cuentoneta/issues/new/choose
[feature-request-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%8F%8E%EF%B8%8F+mejora&projects=&template=feature.yml
[bug-report-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%A6%9F+bug&projects=&template=bug_report.yml
[doc-]: https://github.com/cuentoneta/cuentoneta/blob/develop/CODE_OF_CONDUCT.md
[doc-mvv]: https://github.com/cuentoneta/cuentoneta/blob/develop/MVV.md
