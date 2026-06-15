# Guía del proyecto — La Cuentoneta

> **Propósito:** este documento define estándares de código, principios de arquitectura y convenciones de tooling para **La Cuentoneta**. Claude Code debe seguir estas reglas al generar, revisar o modificar código.

> **Idioma:** la documentación y las reviews van en **español**; el **código siempre en inglés** (los comentarios pueden ir en español). Los identificadores, nombres de archivo, ramas y mensajes de commit siguen las convenciones de abajo.

> **Políticas de agentes de IA:** todo agente que opere sobre este repo debe seguir además [`.claude/references/coding-agent-policies.md`](.claude/references/coding-agent-policies.md) y **cargarlo al inicio de cada sesión, antes de generar recomendaciones**. Es una restricción dura, al mismo nivel que las de este archivo.

---

## Índice

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Comandos comunes](#comandos-comunes)
3. [Restricciones duras (Hard Constraints)](#restricciones-duras-hard-constraints)
4. [Arquitectura de código (Angular)](#arquitectura-de-código-angular)
5. [Estado: signals-first (sin NgRx)](#estado-signals-first-sin-ngrx)
6. [Backend API (Hono + Sanity)](#backend-api-hono--sanity)
7. [Anti-Corruption Layer (mappers)](#anti-corruption-layer-mappers)
8. [Testing](#testing)
9. [Manejo de errores](#manejo-de-errores)
10. [Convenciones de Git](#convenciones-de-git)
11. [Archivos de referencia](#archivos-de-referencia)

---

## Resumen del proyecto

| Aspecto                | Valor                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Framework**          | Angular 21 (standalone, **zoneless**, OnPush, SSR/hidratación)  |
| **Lenguaje**           | TypeScript (modo estricto)                                      |
| **Monorepo**           | Nx 22 (single-project `@cuentoneta/app`) — builder vite/esbuild |
| **Gestor de paquetes** | **pnpm** (10.x). `npm`/`yarn` están bloqueados (`only-allow`)   |
| **Backend**            | **Hono** (`src/api/`) + `@hono/zod-validator`                   |
| **Persistencia/CMS**   | **Sanity** (GROQ) vía `@sanity/client`. Studio en `/cms`        |
| **Testing**            | **Vitest** + Angular Testing Library + `@test-utils`            |
| **Estilos**            | Tailwind v4 + Stylelint                                         |
| **Componentes**        | Storybook 10                                                    |

**Aliases de paths** (ver `tsconfig.json`): `@components/*`, `@mocks/*`, `@models/*`, `@utils/*`, `@test-utils`.

**Prefijo de selectores:** componentes `cuentoneta-` (kebab-case, elemento); directivas `cuentoneta` (camelCase, atributo).

---

## Comandos comunes

Usar **siempre `pnpm`** para instalar y ejecutar scripts. Los scripts envuelven targets de Nx del proyecto `@cuentoneta/app`.

| Comando                                   | Descripción                          |
| ----------------------------------------- | ------------------------------------ |
| `pnpm install`                            | Instala dependencias                 |
| `pnpm dev`                                | Dev server (SSR) en desarrollo       |
| `pnpm build`                              | Build de producción                  |
| `pnpm lint`                               | ESLint sobre `src/**/*.{ts,html}`    |
| `pnpm stylelint`                          | Stylelint sobre CSS                  |
| `pnpm test`                               | Tests unitarios (Vitest)             |
| `pnpm test:watch`                         | Tests en watch                       |
| `pnpm test:e2e`                           | E2E (Playwright)                     |
| `pnpm storybook` / `pnpm storybook:build` | Storybook dev / build                |
| `pnpm sanity:dev`                         | Studio de Sanity (`@cuentoneta/cms`) |
| `pnpm sanity:extract-schema`              | Extrae el schema de Sanity           |
| `pnpm sanity:run-typegen-generator`       | Genera tipos a partir del schema     |

**Gates de CI** (deben quedar verdes en cada PR): `test`, `lint`, `stylelint`, `e2e`, `build`, `storybook`.

---

## Restricciones duras (Hard Constraints)

Reglas no negociables. Una violación requiere justificación explícita.

| Restricción                                  | Límite / regla                                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Largo de función                             | ≤ 50 líneas                                                                                     |
| Largo de archivo                             | ≤ 500 líneas (los `*.spec.ts` quedan exentos)                                                   |
| Complejidad ciclomática                      | ≤ 10                                                                                            |
| Profundidad de anidamiento                   | ≤ 3 niveles                                                                                     |
| Barrels (`index.ts` re-export)               | **Prohibidos** en todo el proyecto (ESLint `no-barrel-files`)                                   |
| Tipo `any`                                   | Prohibido sin un comentario `// REASON:` (ESLint `no-explicit-any`)                             |
| `// @ts-ignore`                              | Prohibido sin issue enlazado                                                                    |
| `console.log`                                | Quitar antes de commitear                                                                       |
| `enum` de TypeScript                         | **Prohibidos** — usar `Object.freeze({...} as const)` (ver abajo)                               |
| Lifecycle hooks (`OnInit`, etc.)             | **Prohibidos** — usar signals / `computed` / `effect` / `viewChild` / `contentChild`            |
| Propiedades estáticas                        | **Prohibidas** — usar un servicio singleton (`providedIn: 'root'`)                              |
| Imports type-only                            | Usar `type` cuando un import se use solo como anotación de tipo (`isolatedModules`)             |
| Literales de tiempo crudos                   | Usar duration strings (`'15m'`, `'1h'`, `'7d'`) resueltas en el punto de uso, no `60000`        |
| `vi.fn()` / `vi.mock()` / `vi.*`             | **Prohibido** el uso directo — usar los wrappers de `@test-utils` (ESLint `viRestrictedSyntax`) |
| `firstValueFrom`/`lastValueFrom`/`toPromise` | **Prohibidos** en el frontend — usar `computed()`/`toSignal()`/operadores RxJS                  |
| Non-null assertion (`!`)                     | Prohibido (ESLint `no-non-null-assertion`)                                                      |
| Non-self-closing / control flow viejo        | Plantillas: `@if`/`@for` (no `*ngIf`/`*ngFor`), self-closing tags, `ngSrc`                      |

### `Object.freeze()` en vez de `enum`

```typescript
// ✅ Correcto
export const MediaType = Object.freeze({
	AUDIO: 'audio',
	VIDEO: 'video',
} as const);
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

// ❌ Incorrecto
export enum MediaType {
	AUDIO = 'audio',
	VIDEO = 'video',
}
```

Beneficios: idiomático en JS, mejor tree-shaking, sin runtime overhead de TS, funciona con `typeof`/`keyof`.

---

## Arquitectura de código (Angular)

> Principios: [`solid.md`](.claude/references/solid.md) · [`cupid.md`](.claude/references/cupid.md) · [`guiding-principles.md`](.claude/references/guiding-principles.md) · [`clean-architecture.md`](.claude/references/clean-architecture.md)
>
> Detalle de componentes: [`angular-components.md`](.claude/references/angular-components.md)

### Visibilidad de campos

Los campos de clase de un componente usan `protected` — nunca `public` implícito. Las plantillas de Angular acceden a miembros `protected`, así que no hay razón para exponerlos. Lo que no se usa en la plantilla va `private`.

- `protected` → campos/métodos usados solo en la plantilla del propio componente.
- `private` → internos, no referenciados en ninguna plantilla.
- `public` → **solo** inputs/outputs/models de signals (`input()`, `output()`, `model()`), API imperativa llamada por padres (`open()`, `close()`), y miembros requeridos por interfaces.

### `effect()` como field initializers nombrados

Todo `effect()` / `afterRenderEffect()` / `afterNextRender()` se declara como **field initializer nombrado**, nunca dentro del `constructor`. Los field initializers de clases decoradas corren en contexto de inyección.

```typescript
// ✅ Correcto
export class StoryComponent {
	private readonly store = inject(StoryService);
	private readonly syncEffect = effect(() => {
		const slug = this.slug();
		untracked(() => this.load(slug));
	});
}

// ❌ Incorrecto — effect dentro del constructor
```

- Nombres descriptivos (`syncSlugEffect`, `closeOnSuccessEffect`).
- Los campos referenciados por el effect se declaran **antes** que el effect en el orden del cuerpo de la clase.

### App initializers

`provideAppInitializer` usa una factory nombrada en un archivo `<nombre>.initializer.ts` que devuelve un closure async; nunca lógica inline en `app.config.ts`.

### Control flow y change detection

- Componentes standalone, `ChangeDetectionStrategy.OnPush`, app **zoneless**.
- Plantillas con `@if` / `@for` / `@switch` (nunca `*ngIf`/`*ngFor`), self-closing tags y `ngSrc` para imágenes.
- Inyección con `inject()` (no inyección por constructor).

---

## Estado: signals-first (sin NgRx)

> Detalle: [`angular-state.md`](.claude/references/angular-state.md)

Cuentoneta **no usa NgRx**. El estado se modela con **servicios + signals + RxJS**. Las reglas "signals-first" se adoptan como **principio**, no como mecanismo `rxMethod`/Signal Store.

**Reglas:**

1. **Sin promesas sobre observables:** prohibido `firstValueFrom`, `lastValueFrom`, `toPromise`, y `async/await` sobre observables en el frontend. Componer con operadores RxJS.
2. **Derivar con `computed()` / `toSignal()`** en vez de mantener estado duplicado. Los valores derivados son `computed`, nunca estado guardado.
3. **Debounce / coordinación centralizados en servicios** (p. ej. `LayoutService`), no esparcidos en componentes.
4. **Errores tipados por operación** — preferir un estado de error por operación a un único `string | null` compartido.
5. **`switchMap` como operador de aplanado por defecto** para cancelar requests en vuelo obsoletos.
6. Los servicios de acceso a datos del frontend viven en `src/app/providers/` _(en migración al patrón `provideX()` / `_.provider.ts` — ver #1499)\*.

> **Dirección futura (paridad con el starter):** adoptar **NgRx Signal Store** (`@ngrx/signals` + `rxMethod`) — ver **#1530**. Hasta su adopción, rige lo de arriba; **no** generar código NgRx salvo que el issue lo indique.

---

## Backend API (Hono + Sanity)

> Detalle: [`sanity-acl.md`](.claude/references/sanity-acl.md)

El backend es **Hono plano** (no OpenAPIHono). Cada módulo en `src/api/modules/<dominio>/` sigue el patrón **controller → service → repository**, con **mappers (ACL)** traduciendo los resultados crudos de Sanity al modelo de dominio.

### Convención de capas

| Capa           | Archivo                   | Responsabilidad                                                                                    |
| -------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| **Controller** | `<dominio>.controller.ts` | Rutas Hono (`new Hono()`), validación con `zValidator('param'\|'query', schema)`, llama al service |
| **Service**    | `<dominio>.service.ts`    | Lógica de negocio. Funciones `get*()`/`update*()`. Llama al repository y mapea al dominio          |
| **Repository** | `<dominio>.repository.ts` | Acceso a datos. Funciones `fetch*()` que ejecutan `client.fetch(query, params)` (GROQ)             |
| **Schemas**    | `<dominio>.schema.ts`     | Schemas Zod locales del módulo                                                                     |

### Naming de capas

- **Repository → `fetch*()`** para todas las lecturas (`fetchStoryBySlug`, `fetchStories`). Devuelve el resultado **crudo** de la query de Sanity.
- **Service → `get*()`** para lecturas (`getStoryBySlug`, `getStories`). Envuelve al repository y **mapea** al modelo de dominio vía la ACL.
- Validación de params/query con `@hono/zod-validator`; los path params usan `:slug` (estilo Hono).
- El cliente de Sanity se importa desde `_helpers/sanity-connector` (no instanciar `client` ad-hoc).

> **Dirección futura (paridad con el starter):** adoptar **OpenAPIHono** (`@hono/zod-openapi`: `createRoute`/`registerRoute` + spec en `/api/openapi.json`) — ver **#1531**. Hasta su adopción, rige el patrón Hono plano de arriba.

---

## Anti-Corruption Layer (mappers)

> Detalle: [`sanity-acl.md`](.claude/references/sanity-acl.md) · [`domain-model.md`](.claude/references/domain-model.md)

El **ACL es el patrón central** de cuentoneta: los resultados crudos de GROQ **nunca** se filtran al frontend. Los **mappers** en `src/api/_utils/functions.ts` (y `*.functions.ts` vecinos) traducen el shape de Sanity al **modelo de dominio** (`Story`, `Author`, `Storylist`, `Resource`, …).

```
GROQ query → repository.fetch*()  →  service.get*()  →  mapX(rawResult): DomainType  →  controller
            (resultado crudo Sanity)                    (mapper / ACL en _utils)
```

- Los mappers son funciones puras (`mapAuthor`, `mapAuthorTeaser`, `mapResources`, …).
- Helpers de imágenes (`urlFor`, `urlForWithAutoFormat`) también viven en la capa de mappers.
- Al cambiar una query GROQ o un tipo generado de Sanity, actualizar el mapper correspondiente y los tipos de dominio en el **mismo** PR.

---

## Testing

> Detalle: [`testing.md`](.claude/references/testing.md)

- **Runner:** Vitest (`pnpm test`). Setup zoneless en `src/test-setup.ts`.
- **Componentes:** **siempre** Angular Testing Library (`@testing-library/angular`). **Nunca** `ComponentFixture`, `TestBed.createComponent()`, ni queries por `querySelector`/`container`. Testear **comportamiento de usuario**, no implementación.
- **Mocks/timers:** usar los wrappers de **`@test-utils`** (`fn()`, `spyOn()`, `clearAllMocks()`, `useFakeTimers()`, …). **Prohibido** `vi.fn()`/`vi.mock()`/`vi.spyOn()` directo (ESLint `viRestrictedSyntax`). `src/test-utils.ts` es la única excepción.
- **`clearAllMocks()` de `@test-utils` en `beforeEach`** para resetear estado entre tests.
- **Prioridad de queries:** `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId` (último recurso).
- **Storybook:** todo componente nuevo en `src/app/components/` lleva su `*.stories.ts`.

---

## Manejo de errores

> Detalle: [`maintainability.md`](.claude/references/maintainability.md)

- Manejar errores en el nivel adecuado — no atrapar e ignorar. Preservar la causa (`preserve-caught-error`).
- Errores tipados por operación; loguear con contexto suficiente.
- Backend: propagar errores con mensajes accionables; el controller traduce a la respuesta HTTP.
- Frontend: errores tipados por operación expuestos como signals para la UI.

---

## Convenciones de Git

- **Ramas:** `feat/<id_issue>-<descripcion-en-kebab-case>` desde `develop` actualizado (p. ej. `feat/1495-claude-md-and-references`).
- **Commits:** `[#<id_issue>] - <mensaje>` (p. ej. `[#1495] - Crea CLAUDE.md y archivos de referencia`).
- **PRs:** título `[#<id_issue>] - <título>`; cuerpo en español con `Closes #<id_issue>`; base `develop`; milestone correspondiente.
- **Reviews:** en **español**.
- Antes de borrar/sobrescribir archivos generados (p. ej. `tools/author-bios/`), verificar que sean re-generables.

### Scan de impacto en documentación

Si un cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio, actualizar en el **mismo** commit/PR toda la documentación que los referencie: `docs/`, este `CLAUDE.md`, y `.claude/references/`.

---

## Archivos de referencia

`CLAUDE.md` es la guía base; el conocimiento detallado se estratifica en [`.claude/references/`](.claude/references/) y se carga **según el tipo de tarea** (los subagentes de `.claude/agents/` los consumen — ver #1501). `coding-agent-policies.md` se carga **siempre**, al inicio de cada sesión.

| Referencia                 | Contenido                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `coding-agent-policies.md` | Políticas de colaboración de agentes (carga obligatoria al inicio)                  |
| `solid.md`                 | Principios SOLID                                                                    |
| `cupid.md`                 | Propiedades CUPID                                                                   |
| `guiding-principles.md`    | YAGNI / KISS + disciplina de operadores RxJS                                        |
| `cross-reference.md`       | Cómo se relacionan SOLID / CUPID / Clean Architecture / DDD                         |
| `clean-architecture.md`    | Capas, regla de dependencia, "Qualified Implementation" (Sanity/InMemory)           |
| `domain-model.md`          | DDD estratégico (agregados, invariantes, bounded contexts) — Story/Author/Storylist |
| `angular-components.md`    | Componentes, effects, DI/providers, control flow                                    |
| `angular-state.md`         | Estado signals-first sin NgRx (servicios + signals/RxJS)                            |
| `testing.md`               | Vitest + Angular Testing Library + `@test-utils` + Storybook                        |
| `sanity-acl.md`            | GROQ → repository → mapper → modelo de dominio (el ACL central)                     |
| `maintainability.md`       | Mantenibilidad y simplificación estructural                                         |
