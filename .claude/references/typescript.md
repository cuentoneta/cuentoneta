# Convenciones de TypeScript / JavaScript

> Las **reglas terse** viven en la tabla de Hard Constraints de [`CLAUDE.md`](../../CLAUDE.md). Acá está el **rationale y los ejemplos** de las micro-convenciones de TS/JS transversales (no atadas a Angular ni al backend). Cargá esta referencia en tareas con foco en tipos, modelado de constantes o imports.

---

## `Object.freeze()` en vez de `enum`

Los `enum` de TypeScript están **prohibidos**. Para referencias clave/valor usar `Object.freeze({...} as const)` + un tipo derivado.

```typescript
// ✅ Correcto
export const MediaType = Object.freeze({
	AUDIO: 'audio',
	VIDEO: 'video',
} as const);
export type MediaType = (typeof MediaType)[keyof typeof MediaType];
// type MediaType = 'audio' | 'video'

// ❌ Incorrecto
export enum MediaType {
	AUDIO = 'audio',
	VIDEO = 'video',
}
```

**Por qué:**

- Idiomático en JS (objetos planos), sin runtime overhead específico de TS.
- Mejor tree-shaking por los bundlers.
- Más flexible: se puede extender, mergear o computar.
- Funciona naturalmente con `typeof` / `keyof` para derivar el tipo.

**Uso con seguridad de tipos:**

```typescript
function describe(type: MediaType): string {
	return type === MediaType.AUDIO ? 'Audio' : 'Video';
}
```

> **Enforcement activo:** ESLint prohíbe declarar `enum` (`selector: 'TSEnumDeclaration'` dentro de `commonRestrictedSyntax`, en `eslint.config.mjs`), y el repo ya no tiene ninguno: la deuda de migración está saldada. El patrón `Object.freeze` se usa en `src/app/models/content-campaign.model.ts` y `src/app/providers/layout.interface.ts`.

---

## Imports type-only

Usar la palabra clave `type` cuando un import se use **solo** como anotación de tipo. Es requisito de `isolatedModules` (activo en el repo) y reduce el bundle (los type imports se eliminan del output).

```typescript
// ✅ Correcto
import type { Story } from '@models/story.model';
import { type Mock } from '@test-utils';
import { StoryApi } from '../../providers/story-api.interface'; // token, se usa en runtime → sin `type`

// ❌ Incorrecto — falta `type` en imports solo-de-tipo
import { Story } from '@models/story.model';
```

**Cuándo usar `type`:** interfaces, type aliases, o clases usadas solo como tipo (`story: Story` pero nunca `new Story()`).

**Cuándo NO usar `type`:** clases usadas en runtime (constructores, métodos estáticos), funciones, constantes, o cualquier cosa usada en una expresión.

---

## Literales de tiempo / duration strings

No usar números "mágicos" de milisegundos en el código (`60000`, `24 * 60 * 60 * 1000`). Para constantes de tiempo, usar **duration strings** (`'15m'`, `'1h'`, `'7d'`) como fuente de verdad y resolverlas a número **en el punto de uso**.

```typescript
// ✅ Correcto — la duración es legible y la unidad no se codifica en el nombre
const REFRESH_INTERVAL = '15m';

// ❌ Incorrecto — literal de ms crudo / expresión computada / sufijo de unidad en el nombre
const REFRESH_INTERVAL_MS = 900000;
const DEFAULT_INTERVAL = 24 * 60 * 60 * 1000;
```

**Reglas:**

- Sin sufijos `_MS` / `_SECONDS` en el nombre de la constante: la unidad es un detalle de la expresión que la consume, no del nombre.
- Extraer a una constante nombrada los duration strings repetidos (producción o tests).

> **Nota:** hoy el repo **no** tiene un helper `parseDurationToMs()` / `parseDurationToSeconds()` (la convención viene del starter). Si aparece la necesidad real de resolver duration strings a número, introducir ese helper en `@utils` en ese momento; hasta entonces, alcanza con evitar literales de ms crudos y mantener las constantes de tiempo legibles.

---

## Scope de constantes y variables

- **Local por defecto:** declarar `const` dentro del scope de la función cuando la usa una sola función, lo más cerca posible del punto de uso. No subir una constante al tope del archivo si su único consumo está adentro de una sola función.
- **Módulo:** promover a nivel de módulo solo cuando se comparte entre varias funciones del mismo archivo.
- **Global:** solo tras confirmar reuso entre varios archivos.

**Rationale:** una constante declarada 50 líneas lejos de su único uso obliga al lector a saltar entre dos lugares. Co-locarla con su uso (cuando es único) hace el código autocontenido.

## `eslint.config.mjs`: reglas por-scope reemplazan, no mergean

En ESLint flat config, cuando **dos config objects aplican al mismo archivo** y ambos setean la **misma** regla (p. ej. `no-restricted-syntax`), el bloque que matchea **último gana por completo**: su array de opciones **reemplaza** el del bloque anterior, no lo concatena. Un bloque acotado (`files: ['src/app/pages/**/*.ts']`) que redeclara `no-restricted-syntax` con solo sus restricciones nuevas **pierde silenciosamente** las del bloque global (`files: ['**/*.ts']`) para esos archivos.

**Regla:** al acotar `no-restricted-syntax` (u otra regla de array) a un scope, **recomponer** las restricciones base en vez de redeclarar solo las nuevas — típicamente esparciendo la constante común:

```js
// ✅ el bloque de páginas conserva commonRestrictedSyntax (enum, lifecycle hooks, estáticas, CommonJS)
'no-restricted-syntax': ['error', ...commonRestrictedSyntax, ...pageFetchRestrictedSyntax],
```

Precedentes en el propio archivo: `test-utils-vi-exception` (recompone `commonRestrictedSyntax` al soltar `viRestrictedSyntax` para `src/test-utils.ts`) y `ssr-fetch-must-decide-blocking` (recompone `commonRestrictedSyntax` al sumar las restricciones de fetch de página; #1705). La única parte que **sí** se puede soltar sin recomponer es la que no aplica al scope (`viRestrictedSyntax` en un bloque que ya `ignores: ['**/*.spec.ts']`, porque `vi.*` solo aparece en specs).
