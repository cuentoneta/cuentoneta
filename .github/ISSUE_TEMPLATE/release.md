---
name: "\U0001F4BC Preparar lanzamiento de una nueva versión"
about: Checklist para generar la release de un hito de La Cuentoneta
title: 'Generar release para versión _._._ de La Cuentoneta'
labels: "\U0001F4BC gestión"
assignees: ''
---

## Tareas

- [ ] Ajustar changelog.
- [ ] Actualizar versión en package.json.
- [ ] Sanity: Determinar si hay scripts de actualización de datos a ejecutar.
- [ ] Chequear si deben actualizarse en la documentación del proyecto las versiones de herramientas o dependencias

`(Agregar otras tareas particulares de la versión, en caso de que sea necesario)`

## Pasos automatizados (post-merge a master)

Estos pasos los ejecuta el workflow `release.yml` automáticamente al mergear `develop → master` con la versión bumpeada en `package.json`. No requieren acción manual:

- Creación del tag y publicación del GitHub Release (notas del CHANGELOG + listado de PRs).
- Deploy de Sanity Studio.

## Criterios de aceptación

- [ ] Verificar que no reste ningún issue por ser resuelto en el hito.
- [ ] Tener todas las tareas adjuntas en la descripción completadas.
