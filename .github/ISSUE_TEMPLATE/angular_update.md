---
name: ⬆️ Actualizar Angular
about: Actualizar Angular a una nueva versión del framework
title: 'Actualizar Angular a versión X.Y'
labels: '🛠️ tooling, 🅰️ angular'
assignees: ''
---

### Descripción

Debe actualizarse Angular para utilizar la nueva versión `X.Y` del framework.

### Tareas

- [ ] Listar issues para cambios en la plataforma que estén relacionados a las nuevas features de la versión (ver sección de Recursos).
- [ ] Generar minuta de issues a crear con motivo de las nuevas features del framework.
- [ ] Chequear compatibilidad de dependencias relacionadas a Angular
  - [ ] ng-icons
  - [ ] angular-eslint
  - [ ] Storybook (`@storybook/angular-vite`)
  - [ ] Plugins de Analog para Vitest
  - [ ] TypeScript y typescript-eslint

### Tareas derivadas

_Issues que pueden abordarse una vez terminada la migración a la nueva versión de Angular:_

- [ ] `(completar)`

### Recursos

- [Angular X.Y features, by NinjaSquad blog](https://blog.ninja-squad.com/)
- [Guía de actualización de Angular](https://angular.dev/update-guide)

#### Actualización de Angular

1. Ejecutar `pnpm exec ng update @angular/core@X.Y @angular/cli@X.Y`, que aplica los schematics de migración oficiales.
2. Revisar el diff de los schematics antes de commitear.
