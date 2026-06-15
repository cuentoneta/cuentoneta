# Mantenibilidad y simplificación estructural

Una **lente ambiciosa** para reviews y refactors: no te quedes en "esto podría estar un poco más prolijo". Buscá activamente reestructuraciones que hagan un cambio _dramáticamente más simple_ sin alterar el comportamiento — y **preferí borrar complejidad antes que reordenarla**.

Este archivo complementa, y nunca anula, las restricciones duras de [`CLAUDE.md`](../../CLAUDE.md) ni los principios de [`solid.md`](solid.md), [`cupid.md`](cupid.md), [`clean-architecture.md`](clean-architecture.md) y [`guiding-principles.md`](guiding-principles.md). La idea es re-expresada en la voz de este proyecto para que aplique con contexto completo de cuentoneta.

## Postura central

- Buscá el **"movimiento de judo de código"** — una reorganización que aprovecha mejor la arquitectura existente y hace que el cambio se sienta inevitable en retrospectiva, de modo que ramas enteras, helpers, modos, condicionales o capas desaparezcan por completo.
- Premiá implementaciones que **eliminan piezas móviles**, no refactors que apenas reparten la misma complejidad.
- Inclinate por código **directo, aburrido y legible** antes que mecanismos ingeniosos/mágicos. "Funciona" no alcanza si deja el codebase más desordenado.

## Smells a marcar

A propósito son los que nuestras otras referencias subestiman (los smells de tamaño/tipado/naming/test/seguridad ya viven en `CLAUDE.md` y las demás refs — no los re-litigues acá):

- **Crecimiento espagueti.** Nuevos condicionales ad-hoc, booleanos de un solo uso, "modos" nullable, o ramas de caso especial atornilladas sobre un flujo existente y no relacionado. Tratalo como un problema de _diseño_, no como un detalle de estilo — empujá la lógica hacia una abstracción dedicada, un helper, una máquina de estados o un objeto de política.
- **Wrappers finos / de identidad / pasamanos.** Abstracciones que agregan una capa de indirección sin comprar claridad. Marcá la "magia" genérica que esconde una simple suposición sobre la forma de los datos.
- **Inflado de archivos por el diff.** Aunque `CLAUDE.md` topa los archivos en **≤ 500 líneas** (el límite absoluto — ese siempre gana), preguntate también si _este PR_ hizo crecer un archivo de forma significativa: si el código nuevo podría partirse en un módulo/subcomponente enfocado, preferí descomponer antes que dejar el archivo derramarse hacia el tope.
- **Orquestación evitable.** Trabajo independiente serializado sin razón (preferí paralelo), o actualizaciones relacionadas que pueden quedar a medio aplicar (preferí una estructura más atómica). No micro-optimices, pero sí marcá la fragilidad. En el backend, esto aplica a coordinar lecturas de Sanity independientes; en el frontend, a componer streams con los operadores RxJS adecuados.
- **Ramas "temporales"** que probablemente se vuelvan deuda permanente.

## Preguntas primarias para cada cambio relevante

- ¿Hay un reencuadre que necesite **menos conceptos, ramas o capas de helpers**?
- ¿El diff agregó ramificación donde debería existir una **mejor abstracción**, o volvió un módulo antes cohesivo más acoplado / más stateful / más difícil de escanear?
- ¿Esta abstracción **se gana su lugar**, o es un wrapper alrededor de un único call site?
- ¿Podrían **borrarse** categorías enteras de complejidad en vez de pulirlas?

## Remedios preferidos (en orden de preferencia)

1. **Borrar una capa** de indirección en vez de refinarla.
2. **Reencuadrar el modelo de estado** para que los condicionales desaparezcan en vez de centralizarse (p. ej. derivar con `computed()` / `toSignal()` en vez de mantener estado duplicado y sincronizarlo a mano).
3. **Mover el límite de propiedad** para que la feature sea una extensión natural de una abstracción existente.
4. Convertir la lógica de caso especial en un **flujo por defecto más simple** con menos excepciones.
5. Extraer un helper puro, o partir un archivo grande en módulos enfocados.

## Guardrails — mantené conciencia del proyecto

Aplicá esta lente **dentro** de las convenciones del proyecto; un instinto genérico de "simplificar" nunca debe contradecir un patrón mandatorio. En particular, **no** recomiendes cambios que peleen con `CLAUDE.md`, por ejemplo:

- el patrón de capas **controller → service → repository** en `src/api/modules/<dominio>/` (es mandatorio; no es "indirección para colapsar");
- el naming `fetch*()` en repositorios y `get*()`/`update*()` en servicios — no los aplanes en una sola función "para ahorrar una capa";
- el **ACL central**: los resultados crudos de GROQ se traducen al modelo de dominio (`Story`, `Author`, `Storylist`, `Resource`, …) vía **mappers puros** (`mapAuthor`, `mapAuthorTeaser`, …); no filtres el shape crudo de Sanity al frontend "porque es más corto";
- el estilo **signals-first** en `src/app/`: derivar con `computed()`/`toSignal()`, `effect()` como field initializers nombrados, sin promesas sobre observables (`firstValueFrom`/`lastValueFrom`/`toPromise` prohibidos) y `switchMap` como aplanado por defecto;
- `Object.freeze({...} as const)` en vez de `enum`; campos de componente `protected`/`private` (no `public` implícito); plantillas con `@if`/`@for`, self-closing tags y `ngSrc`.

Cuando una simplificación violaría una restricción dura o una convención establecida, **descartala** — la restricción gana. Mostrá solo reestructuraciones que sean a la vez más simples **y** compatibles con las convenciones.
