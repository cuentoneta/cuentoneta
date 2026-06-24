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
- [ ] ~~Generar release desde GitHub (tag + notas)~~ _(automatizado por el workflow `release.yml` al mergear a master)_
- [ ] ~~Sanity: Hacer deploy de Sanity Studio~~ _(automatizado por el workflow `release.yml` al mergear a master)_
- [ ] Chequear si deben actualizarse en la documentación del proyecto las versiones de herramientas o dependencias

`(Agregar otras tareas particulares de la versión, en caso de que sea necesario)`

## Criterios de aceptación

- [ ] Verificar que no reste ningún issue por ser resuelto en el hito.
- [ ] Tener todas las tareas adjuntas en la descripción completadas.
