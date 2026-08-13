---
name: "\U0001F4BC Preparar lanzamiento de una nueva versión"
about: Checklist para generar la release de un hito de La Cuentoneta
title: 'Generar release para versión _._._ de La Cuentoneta'
labels: "\U0001F4BC gestión, release"
assignees: ''
---

## Tareas

- [ ] Ajustar changelog.
- [ ] Actualizar la descripción del milestone, condensando a un párrafo la prosa del changelog: es el único resumen de la versión que se lee desde la lista de hitos.
- [ ] Actualizar versión en package.json.
- [ ] Sanity: Determinar si hay migraciones de datos a ejecutar y **clasificarlas**, porque de eso depende cuándo corren:
  - **Independientes del código** (pueblan un campo que nadie lee, purgan huérfanos): el orden respecto del deploy es indiferente.
  - **Acopladas al código** (cambian el nombre de un campo o la forma de su valor): ninguna secuencia simple es segura. Anotar para cada una en qué momento corre y, si no hay un lector tolerante a ambas formas, qué ventana se asume.
- [ ] Chequear si deben actualizarse en la documentación del proyecto las versiones de herramientas o dependencias

`(Agregar otras tareas particulares de la versión, en caso de que sea necesario)`

## Pasos automatizados (post-merge a master)

Estos pasos los ejecuta el workflow `release.yml` automáticamente al mergear `develop → master` con la versión bumpeada en `package.json`. No requieren acción manual:

- Creación del tag y publicación del GitHub Release (notas del CHANGELOG + listado de PRs).
- Deploy de Sanity Studio.

## Criterios de aceptación

- [ ] Verificar que no reste ningún issue por ser resuelto en el hito.
- [ ] Tener todas las tareas adjuntas en la descripción completadas.
