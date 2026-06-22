# Guía del proyecto — La Cuentoneta

> **Propósito:** este documento define estándares de código, principios de arquitectura y convenciones de tooling para **La Cuentoneta**. Claude Code debe seguir estas reglas al generar, revisar o modificar código. Es la guía **siempre presente**; el detalle del "cómo" vive en [`.claude/references/`](.claude/references/) y se carga **según la tarea** (ver [Carga estratificada de referencias](#carga-estratificada-de-referencias)).

> **Idioma:** la documentación y las reviews van en **español**; el **código siempre en inglés** (los comentarios pueden ir en español). Identificadores, nombres de archivo, ramas y mensajes de commit siguen las convenciones de abajo.

> **Políticas de agentes de IA:** todo agente que opere sobre este repo debe seguir además [`.claude/references/coding-agent-policies.md`](.claude/references/coding-agent-policies.md) y **cargarlo al inicio de cada sesión, antes de generar recomendaciones**. Es una restricción dura, al mismo nivel que las de este archivo.

---

## Índice

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Comandos comunes](#comandos-comunes)
3. [Restricciones duras (Hard Constraints)](#restricciones-duras-hard-constraints)
4. [Convenciones del repo](#convenciones-del-repo)
5. [Carga estratificada de referencias](#carga-estratificada-de-referencias)

---

## Resumen del proyecto

| Aspecto                | Valor                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Framework**          | Angular 21 (standalone, **zoneless**, OnPush, SSR/hidratación)  |
| **Lenguaje**           | TypeScript (modo estricto)                                      |
| **Monorepo**           | Nx 23 (single-project `@cuentoneta/app`) — builder vite/esbuild |
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

| Restricción                                               | Límite / regla                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Largo de función                                          | ≤ 50 líneas                                                                                                                                                                                                                                                                                                                                                    |
| Largo de archivo                                          | ≤ 500 líneas (los `*.spec.ts` quedan exentos)                                                                                                                                                                                                                                                                                                                  |
| Complejidad ciclomática                                   | ≤ 10                                                                                                                                                                                                                                                                                                                                                           |
| Profundidad de anidamiento                                | ≤ 3 niveles                                                                                                                                                                                                                                                                                                                                                    |
| Barrels (`index.ts` re-export)                            | **Prohibidos** en todo el proyecto (ESLint `no-barrel-files`)                                                                                                                                                                                                                                                                                                  |
| Tipo `any`                                                | Prohibido sin un comentario `// REASON:` (ESLint `no-explicit-any`)                                                                                                                                                                                                                                                                                            |
| `// @ts-ignore`                                           | Prohibido sin issue enlazado                                                                                                                                                                                                                                                                                                                                   |
| `console.log`                                             | Quitar antes de commitear                                                                                                                                                                                                                                                                                                                                      |
| `enum` de TypeScript                                      | **Prohibidos** — usar `Object.freeze({...} as const)` → [`typescript.md`](.claude/references/typescript.md)                                                                                                                                                                                                                                                    |
| Lifecycle hooks (`OnInit`, etc.)                          | **Prohibidos** — usar signals / `computed` / `effect` / `viewChild` / `contentChild`                                                                                                                                                                                                                                                                           |
| `@HostBinding` / `@HostListener` / `:host { @apply ... }` | **Prohibidos** — declarar el host en la propiedad `host` del decorador → [`angular-components.md`](.claude/references/angular-components.md#host-element). Enforced por lint: `@HostBinding`/`@HostListener` (`@angular-eslint/prefer-host-metadata-property`); `:host { @apply ... }` (regla custom de ESLint para estilos inline + de Stylelint para `.css`) |
| Propiedades estáticas                                     | **Prohibidas** — usar un servicio singleton (`providedIn: 'root'`)                                                                                                                                                                                                                                                                                             |
| Imports type-only                                         | Usar `type` cuando un import se use solo como anotación de tipo (`isolatedModules`)                                                                                                                                                                                                                                                                            |
| Literales de tiempo crudos                                | Usar duration strings (`'15m'`, `'1h'`, `'7d'`), no `60000` → [`typescript.md`](.claude/references/typescript.md)                                                                                                                                                                                                                                              |
| `vi.fn()` / `vi.mock()` / `vi.*`                          | **Prohibido** el uso directo — usar los wrappers de `@test-utils` (ESLint `viRestrictedSyntax`)                                                                                                                                                                                                                                                                |
| `firstValueFrom`/`lastValueFrom`/`toPromise`              | **Prohibidos** en el frontend — usar `computed()`/`toSignal()`/operadores RxJS                                                                                                                                                                                                                                                                                 |
| Lógica sobre un signal sin invocarlo                      | **Prohibida** en código TS — leer el valor con `signal()` (ESLint `@angular-eslint/no-uncalled-signals`, typed-linting). En plantillas es punto ciego → [`angular-components.md`](.claude/references/angular-components.md)                                                                                                                                    |
| Non-null assertion (`!`)                                  | Prohibido (ESLint `no-non-null-assertion`)                                                                                                                                                                                                                                                                                                                     |
| Errores atrapados                                         | Preservar la causa (ESLint `preserve-caught-error`); errores tipados por operación                                                                                                                                                                                                                                                                             |
| Plantillas: control flow / tags                           | `@if`/`@for` (no `*ngIf`/`*ngFor`), self-closing tags, `ngSrc`                                                                                                                                                                                                                                                                                                 |

> El **rationale y los ejemplos** de las micro-convenciones de TS/JS (`Object.freeze`, imports type-only, duration strings, scope de constantes) están en [`typescript.md`](.claude/references/typescript.md).

---

## Convenciones del repo

### Git

- **Ramas:** `feat/<id_issue>-<descripcion-en-kebab-case>` desde `develop` actualizado (p. ej. `feat/1495-claude-md-and-references`).
- **Commits:** `[#<id_issue>] - <mensaje>`.
- **PRs:** título `[#<id_issue>] - <título>`; cuerpo en español con `Closes #<id_issue>`; base `develop`; milestone correspondiente. **Reviews en español.**

### Naming

- Archivos `kebab-case`; clases `PascalCase`; funciones/métodos `camelCase`; constantes globales `SCREAMING_SNAKE_CASE`, locales `camelCase`.
- Interfaces **sin** prefijo `I` (salvo que coexista con una clase homónima). Convención **Qualified Implementation**: la interfaz tiene el nombre limpio; las implementaciones llevan prefijo de tecnología (`Sanity*`, `Http*`) y los dobles de test son `InMemory*` (**nunca** `Mock*`).
- **API providers del frontend:** el archivo de la interfaz lleva el sufijo `-api` — `<dominio>-api.interface.ts` (export `<X>Api`) — para distinguirlo de una interfaz del modelo de dominio. La impl y el doble viven en `<dominio>.provider.ts` (`Http<X>Api` + `provide<X>Api()`) y `<dominio>.mock.ts` (`InMemory<X>Api` + `provide<X>ApiMock()`). Ver [`clean-architecture.md`](.claude/references/clean-architecture.md).

### Comentarios

Comentar el **porqué no obvio**, nunca el **qué**. No restatear convenciones ya documentadas en `.claude/references/`, ni el código/tipos/nombres. El rationale de un cambio (qué reemplaza, contexto histórico) va al **commit/PR**, no inline. Detalle y ejemplos en [`coding-agent-policies.md`](.claude/references/coding-agent-policies.md) (Sección 3).

### Arquitectura (resumen)

- **Frontend:** Angular standalone, **zoneless**, OnPush; estado **signals-first sin NgRx** (servicios + signals/RxJS). Sin `firstValueFrom`/`toPromise`; derivar con `computed()`/`toSignal()`. Detalle: [`angular-components.md`](.claude/references/angular-components.md) · [`angular-state.md`](.claude/references/angular-state.md).
- **Backend:** **Hono plano** (`src/api/modules/<dominio>/`) con el patrón **controller → service → repository** y un **Anti-Corruption Layer de mappers** (`src/api/_utils/`) que traduce los resultados crudos de Sanity/GROQ al modelo de dominio. Repos `fetch*()` (crudo), services `get*()` (mapean a dominio). Detalle: [`sanity-acl.md`](.claude/references/sanity-acl.md) · [`clean-architecture.md`](.claude/references/clean-architecture.md).

### Dirección futura (paridad con el starter)

Como dirección objetivo —**no adoptada**— se evalúa **NgRx Signal Store** (#1530) y **OpenAPIHono** (#1531). Hasta que esos issues cambien de estado, **no** se genera código NgRx ni OpenAPIHono salvo que el issue lo pida. Detalle en [`angular-state.md`](.claude/references/angular-state.md) y [`sanity-acl.md`](.claude/references/sanity-acl.md).

### Scan de impacto en documentación

Si un cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio, actualizar en el **mismo** commit/PR toda la documentación que los referencie: `docs/`, este `CLAUDE.md`, y `.claude/references/`.

### Config de Claude (equipo vs personal)

- **`.mcp.json`** (raíz, versionado): servidores MCP del equipo — **Sanity** (remoto `https://mcp.sanity.io`, OAuth; no requiere token en el archivo), **Figma** (remoto `https://mcp.figma.com/mcp`, OAuth; para desarrollo de componentes a partir del diseño) y **nx** (análisis del workspace). Sin secrets.
- **`.claude/settings.json`** (versionado): permisos de equipo — `deny` de lectura/escritura/edición de `.env*` en la raíz y en cualquier subdirectorio (`**/.env*`, cubre `./.env` y `./cms/.env`), más bloqueo de su creación por shell (redirecciones `>`/`>>`, `tee`, `touch`, `cp`, `mv`); y una `allow` mínima (gates de CI con `pnpm` + inspección read-only de git/gh).
- **`.claude/settings.local.json`** y **`.claude/worktrees/`**: **personales/locales**, gitignoreados. Las allowlists o MCP propios de cada quien van ahí — p. ej. el **Figma Dev Mode** local (`http://127.0.0.1:3845/sse`), que requiere la app de escritorio corriendo y es distinto del servidor remoto de Figma versionado en `.mcp.json`.

---

## Carga estratificada de referencias

`CLAUDE.md` (este archivo) se carga **siempre**. El conocimiento detallado vive en [`.claude/references/`](.claude/references/) y se carga **según el tipo de tarea** (los subagentes de `.claude/agents/` lo consumen — ver #1501). `coding-agent-policies.md` se carga **siempre**, al inicio de cada sesión.

**Qué cargar según la tarea:**

| Cuando trabajes en…                  | Cargá                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Cualquier sesión (siempre)           | `coding-agent-policies`                                                                            |
| Componentes / plantillas Angular     | `angular-components`, `angular-state`                                                              |
| Estado / servicios / RxJS            | `angular-state`, `guiding-principles`                                                              |
| Backend / Sanity / GROQ / mappers    | `sanity-acl`, `clean-architecture`, `domain-model`                                                 |
| Modelo de dominio / DDD              | `domain-model`, `clean-architecture`                                                               |
| Tests (Vitest / Storybook)           | `testing`                                                                                          |
| Tipos / constantes / imports (TS/JS) | `typescript`                                                                                       |
| Decisiones de diseño / arquitectura  | `solid`, `cupid`, `guiding-principles`, `cross-reference`, `clean-architecture`, `maintainability` |

**Catálogo completo (`.claude/references/`):**

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
| `typescript.md`            | Micro-convenciones TS/JS (`Object.freeze`, type-only, duration strings)             |
| `maintainability.md`       | Mantenibilidad y simplificación estructural                                         |
