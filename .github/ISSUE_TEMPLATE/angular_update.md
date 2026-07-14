---
name: ⬆️ Actualizar Angular
about: Actualizar Angular (y Nx) a una nueva versión del framework
title: 'Actualizar Angular a versión X.Y y Nx a versión Z'
labels: '🛠️ tooling'
assignees: ''
---

### Descripción

Debe actualizarse Angular, y por consiguiente Nx, para utilizar la nueva versión `X.Y` del framework.

### Tareas

- [ ] Actualizar Nx a la versión `Z`, la cual posee soporte para Angular `X.Y`
- [ ] Listar issues para cambios en la plataforma que estén relacionados a las nuevas features de la versión (ver sección de Recursos).
- [ ] Generar minuta de issues a crear con motivo de las nuevas features del framework.
- [ ] Chequear compatibilidad de dependencias relacionadas a Angular fuera del ecosistema de Nx
  - [ ] ng-icons

### Tareas derivadas

_Issues que pueden abordarse una vez terminada la migración a las nuevas versiones de Nx y Angular:_

- [ ] `(completar)`

### Recursos

- [Angular X.Y features, by NinjaSquad blog](https://blog.ninja-squad.com/)
- [Nx Z release notes](https://github.com/nrwl/nx/releases/tag/Z)

#### Actualización de Nx

1. Ejecutar `nx migrate latest`, donde `latest` puede reemplazarse con la versión específica a la que se desea migrar.
2. Ejecutar `nx migrate --run-migrations`
