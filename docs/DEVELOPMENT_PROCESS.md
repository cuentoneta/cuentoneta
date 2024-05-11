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

Las prácticas de nuestro proceso de desarrollo, más las herramientas utilizadas para la gestión del mismo, están abiertos a propuestas para mejoras, cambios y reemplazos. En caso de que desees aportar sugerencias o propuestas de mejorar el proceso de desarrollo, puedes hacerla el canal **[**#🚐 | la-cuentoneta**][dc-channel]** en Discord o en sumar un issue de tipo **[💼 Proponer mejoras en la Gestión o el Proceso de Desarrollo del Proyecto](https://github.com/cuentoneta/cuentoneta/issues/new/choose)**.

## Consideraciones Iniciales

La Cuentoneta es un proyecto abierto tanto en el código como en su gestión, siendo pública y de libre acceso toda la información relacionada a su desarrollo, estando esto en línea con el [Código de Conducta](doc-code_of_conduct) y la declaración de [Misión, Visión y Valores](doc-mmv).

Dada la naturaleza del proyecto, es importante que tengas en consideración que:

- Procuramos simplicidad en la organización del proyecto y en la gestión del desarrollo.
- El proyecto tiene objetivos claros, definidos y de largo plazo, por lo que es importante que las propuestas de mejoras o cambios en el proceso de desarrollo estén alineadas con los objetivos del proyecto.
- Existen herramientas más o menos arraigadas al proyecto, algunas de las cuales es complejo reemplazar. Para aquellas que revistan un cambio significativo, se deberá evaluar su impacto y viabilidad.
- Antes de proponer mejoras te familiarices con el proceso de desarrollo en su estado actual y en las herramientas que utilizamos.
- Tengas en cuenta que la disponibilidad de tiempo y recursos de quienes contribuyen al proyecto puede variar, no estando ningún contribuyente dedicado a tiempo completo al proyecto. Volveremos sobre este punto luego.

## Prácticas de Desarrollo

### Desarrollo en Ramas

Se utiliza el modelo de ramas `master` y `develop` para el desarrollo del proyecto. Las ramas de `feature` y `bugfix` se utilizan para el desarrollo de nuevas funcionalidades y corrección de errores, respectivamente.

- La rama `master` es la rama principal del proyecto, donde se encuentra el código estable y listo para producción.
- La rama `develop` es la rama de desarrollo, donde se integran los cambios de las diversas ramas `feature` y `bugfix` para su revisión y pruebas.
- **Contribución mediante Pull Requests**: Se utilizan Pull Requests para la revisión de código y la integración de cambios en la rama `develop`.

---

[dc-channel]: https://discord.com/channels/594363964499165194/1109220285841944586
[github-issues-tutorial]: https://docs.github.com/es/issues/tracking-your-work-with-issues/creating-an-issue
[crear-issue-cuentoneta]: https://github.com/rolivencia/cuentoneta/issues/new/choose
[feature-request-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%8F%8E%EF%B8%8F+mejora&projects=&template=feature.yml
[bug-report-template]: https://github.com/rolivencia/cuentoneta/issues/new?assignees=&labels=%F0%9F%A6%9F+bug&projects=&template=bug_report.yml
[doc-code_of_conduct]: https://github.com/cuentoneta/cuentoneta/blob/develop/CODE_OF_CONDUCT.md
[doc-mvv]: https://github.com/cuentoneta/cuentoneta/blob/develop/MVV.md
