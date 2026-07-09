---
name: "\U0001F4BC Preparar lanzamiento de una nueva versión"
about: Checklist para generar la release de un hito de La Cuentoneta
title: 'Generar release para versión _._._ de La Cuentoneta'
labels: "\U0001F4BC gestión, release"
assignees: ''
---

## Tareas

- [ ] Ajustar changelog.
- [ ] Actualizar versión en package.json.
- [ ] Sanity: Determinar si hay scripts de actualización de datos a ejecutar.
- [ ] Chequear si deben actualizarse en la documentación del proyecto las versiones de herramientas o dependencias

`(Agregar otras tareas particulares de la versión, en caso de que sea necesario)`

## Flujo automatizado

1. **PR de release → `develop`:** el skill `release-workflow` prepara bump + CHANGELOG (+ `.github/release-steps/<versión>.md` si hay pasos manuales). El issue debe tener el label `release` (lo aplica este template).
2. **Tras el merge a `develop`:** el workflow `prepare-release-pr` crea o actualiza el PR `develop → master` con las notas del CHANGELOG y los pasos manuales. Si el milestone aún tiene issues abiertos (además del de release), no crea el PR (warning); re-disparar con `workflow_dispatch` y `force` si hace falta.
3. **Merge a `master` (manual):** dispara `release.yml` → tag + GitHub Release + deploy de Sanity Studio. El deploy de la app lo cubre Vercel.

## Pasos automatizados (post-merge a master)

Estos pasos los ejecuta el workflow `release.yml` automáticamente al mergear `develop → master` con la versión bumpeada en `package.json`. No requieren acción manual:

- Creación del tag y publicación del GitHub Release (notas del CHANGELOG + listado de PRs).
- Deploy de Sanity Studio.

## Criterios de aceptación

- [ ] Verificar que no reste ningún issue por ser resuelto en el hito.
- [ ] Tener todas las tareas adjuntas en la descripción completadas.
