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

> **`as const` también aplica a arrays de claves, no solo a objetos.** Un array de literales sin `as const` colapsa su tipo derivado a `string`, lo que vuelve inverificable cualquier indexación posterior (TypeScript deja de poder angostar qué claves son válidas). Es el mismo mecanismo que en el objeto de arriba: sin `as const`, se pierde el tipo literal.

> **Enforcement activo:** ESLint prohíbe declarar `enum` (`selector: 'TSEnumDeclaration'` dentro de `commonRestrictedSyntax`, en `eslint.config.mjs`), y el repo ya no tiene ninguno: la deuda de migración está saldada. El patrón `Object.freeze` se usa en `src/models/content-campaign.model.ts`, `src/app/providers/layout.interface.ts` y `src/models/literary-work.model.ts` (`createLiteraryWork`).

---

## Imports type-only

Usar la palabra clave `type` cuando un import se use **solo** como anotación de tipo. Es requisito de `isolatedModules` (activo en el repo) y reduce el bundle (los type imports se eliminan del output).

```typescript
// ✅ Correcto
import type { LiteraryWork } from '@models/literary-work.model';
import { type Mock } from '@test-utils';
import { createLiteraryWork } from '@models/literary-work.model'; // función, se usa en runtime → sin `type`

// ❌ Incorrecto — falta `type` en imports solo-de-tipo
import { LiteraryWork } from '@models/literary-work.model';
```

**Cuándo usar `type`:** interfaces, type aliases, o clases usadas solo como tipo (`literaryWork: LiteraryWork` pero nunca `new LiteraryWork()`).

**Cuándo NO usar `type`:** clases usadas en runtime (constructores, métodos estáticos), funciones, constantes, o cualquier cosa usada en una expresión.

---

## `zod/mini` como namespace en los DTO del frontend

Los DTO de wire del frontend (`src/models/**/*.dto.ts`) validan la respuesta HTTP antes de mapearla a dominio, y cruzan al bundle del navegador — a diferencia de los schemas del backend (`src/api/**`, `@schemas/*`), que corren en Node y usan zod clásico sin restricción, porque ahí el tamaño del paquete no se paga en el cliente. En los DTO del frontend, importar **como namespace** es la única forma que tree-shakea:

```typescript
// ✅ Correcto — namespace: el bundler solo incluye lo que el schema usa
import * as z from 'zod/mini';

export const literaryWorkTeaserDtoSchema = z.object({
	slug: z.string(),
	title: z.optional(z.string()),
});

// ❌ Incorrecto — el paquete completo no tree-shakea
import { z } from 'zod';

// ❌ Incorrecto — parece la corrección obvia (es `zod/mini`) pero no lo es
import { z } from 'zod/mini';
```

**Por qué:** `zod/mini` reexporta un objeto namespace pensado para tree-shakear función por función. Traer su `z` por nombre (`import { z } from 'zod/mini'`) **materializa ese objeto** y devuelve la librería entera al bundle — con el agravante de que reduce el tamaño lo suficiente frente a zod clásico como para parecer una mejora real, cuando en rigor sigue arrastrando el paquete completo. Medido en aislamiento con `esbuild --bundle --minify` sobre el mismo schema:

| Forma del import                | raw       | gzip     |
| ------------------------------- | --------- | -------- |
| `import { z } from 'zod'`       | 327 480 B | 65 096 B |
| `import { z } from 'zod/mini'`  | 306 241 B | 58 861 B |
| `import * as z from 'zod/mini'` | 15 221 B  | 5 438 B  |

**API standalone, no encadenado:** `zod/mini` no expone el API fluido de zod clásico (`.optional()`, `.extend()`, `.array()` sobre un schema existente). Se usa su forma standalone: `z.optional(schema)`, `z.extend(base, {...})`, `z.array(schema)`.

**Enforcement activo:** la regla propia `cuentoneta/no-full-zod-in-browser` ([`tools/eslint/no-full-zod-in-browser.js`](../../tools/eslint/no-full-zod-in-browser.js)) cubre `src/models/**` y `src/app/**`, y rechaza el paquete completo, sus subpaths versionados (`zod/v4`, `zod/v3`) y el import por nombre de las variantes tree-shakables. Va como regla propia y no con `no-restricted-imports`: ese scope se solapa con varios bloques que ya declaran esa regla y la de sintaxis, y en flat config redeclararlas **reemplaza** sus arrays (ver la sección siguiente), así que cubrirlo con reglas core costaba recomponer a mano restricciones ajenas y perder cualquiera de ellas no rompe nada — solo deja de proteger.

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

**Excepción — archivos con `@Component`, `@Directive`, `@Injectable` o `@Service`:** ahí la configuración propia de la clase (mapas `size → clase`, tablas de iconos o de estilo) **no** se promueve a nivel de módulo aunque la usen varios métodos: va como `private readonly` de instancia. La excepción termina donde termina la propiedad: una correspondencia que sigue siendo verdadera fuera de cualquier clase no es configuración de ninguna, y se declara una sola vez en un módulo propio sin decoradores. La regla y su rationale están en [`angular-components.md`](angular-components.md#configuraci%C3%B3n-de-la-clase); la aplica la regla de ESLint `component-config-in-class`.

**Rationale:** una constante declarada 50 líneas lejos de su único uso obliga al lector a saltar entre dos lugares. Co-locarla con su uso (cuando es único) hace el código autocontenido.

## `eslint.config.mjs`: reglas por-scope reemplazan, no mergean

En ESLint flat config, cuando **dos config objects aplican al mismo archivo** y ambos setean la **misma** regla (p. ej. `no-restricted-syntax`), el bloque que matchea **último gana por completo**: su array de opciones **reemplaza** el del bloque anterior, no lo concatena. Un bloque acotado (`files: ['src/app/pages/**/*.ts']`) que redeclara `no-restricted-syntax` con solo sus restricciones nuevas **pierde silenciosamente** las del bloque global (`files: ['**/*.ts']`) para esos archivos.

**Regla:** al acotar `no-restricted-syntax` (u otra regla de array) a un scope, **recomponer** las restricciones base en vez de redeclarar solo las nuevas — típicamente esparciendo la constante común:

```js
// ✅ el bloque de páginas conserva commonRestrictedSyntax (enum, lifecycle hooks, estáticas, CommonJS)
'no-restricted-syntax': ['error', ...commonRestrictedSyntax, ...pageFetchRestrictedSyntax],
```

Precedentes en el propio archivo: `test-utils-vi-exception` (recompone `commonRestrictedSyntax` al soltar `viRestrictedSyntax` para `src/test-utils.ts`), `ssr-fetch-must-decide-blocking` (recompone `commonRestrictedSyntax` al sumar las restricciones de fetch de página) y el bloque `cms` (recompone `commonRestrictedSyntax` soltando `viRestrictedSyntax` para todo `cms/**/*.ts`/`.tsx`, con un motivo propio: no es que `vi.*` no aplique ahí como en `test-utils-vi-exception`, sino que en `cms/` no existe `@test-utils` al que redirigir — sus dobles se escriben a mano). La única parte que **sí** se puede soltar sin recomponer es la que no aplica al scope (`viRestrictedSyntax` en un bloque que ya `ignores: ['**/*.spec.ts']`, porque `vi.*` solo aparece en specs).

---

## `allowImportingTsExtensions`: dónde vive y por qué no en el raíz

Un import relativo con extensión `.ts` solo compila si el programa lo declara con `allowImportingTsExtensions`, y TypeScript lo condiciona (`TS5096`) a que además esté seteado `noEmit`, `emitDeclarationOnly` o `rewriteRelativeImportExtensions`.

En el repo esa forma la necesita **una sola cadena**: la del hook `PreToolUse`, que corre con `node` puro y por eso paga la exigencia de extensión explícita de ESM — ver [`scripts.md`](scripts.md). El flag va en los dos programas que incluyen `scripts/`, nunca en el `tsconfig.json` raíz:

| Archivo                   | Qué declara                                                      | Por qué                                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsconfig.typecheck.json` | `allowImportingTsExtensions`                                     | Ya tiene `noEmit`, que es lo que `TS5096` pide. Es el programa del gate `typecheck`                                                                                                                               |
| `tsconfig.spec.json`      | `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` | Incluye `scripts/**/*.ts` para que Vitest resuelva sus `paths`. **No admite `noEmit`**: con él, el plugin de Angular deja de contar `src/test-setup.ts` como parte del programa y la suite entera falla al cargar |

El raíz queda afuera a propósito: es una config _solution-style_ de la que heredan los proyectos de app, spec, editor, server y Storybook, y **ninguno declara `noEmit`**. Poner el flag arriba obliga a agregárselo a cada proyecto que emite —el de la app entre ellos— o a activar el reescrito de extensiones sobre el emit real.

La habilitación es más amplia que la necesidad: esos dos programas también incluyen `src/`, `e2e/` y `resources/`, y el compilador no tiene cómo distinguir los dos archivos que la precisan del resto. Lo que la acota es **lint**, no la review: la regla `cuentoneta/no-ts-extension-imports` (`tools/eslint/no-ts-extension-imports.js`) marca todo import relativo con extensión `.ts`/`.tsx` y exime la cadena del hook con una allowlist por ruta declarada en la propia regla. Sumar un archivo a esa cadena es una decisión visible en el diff, no un efecto de ampliar un glob.
