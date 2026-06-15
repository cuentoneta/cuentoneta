<!-- Fuente: CLAUDE.md | Adaptado para La Cuentoneta -->

# Principios de Clean Architecture

Construir sistemas **mantenibles, testeables e independientes** de los detalles externos (Sanity, Hono, Angular, el navegador). En cuentoneta esto se traduce en una sola idea operativa: **el modelo de dominio (`Story`, `Author`, `Storylist`, …) no conoce ni a GROQ ni al cliente HTTP**; los detalles externos se traducen en los bordes vía la **ACL de mappers**.

## Principios arquitectónicos centrales

### La regla de dependencia

- Las dependencias del código fuente apuntan **solo hacia adentro**, hacia las políticas de más alto nivel (el dominio).
- Nada de un círculo interno puede saber algo de un círculo externo.
- Los formatos de datos de los círculos externos (p. ej. el shape crudo de una query GROQ, los tipos generados de Sanity) **no deben usarse** en los círculos internos.
- Es la regla que prevalece sobre todas las demás y la que hace que la arquitectura funcione.

### Las capas en cuentoneta (de adentro hacia afuera)

| Capa                        | Contenido                                                        | Ejemplo en cuentoneta                                                           |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Modelo de dominio**       | Tipos de negocio y datos críticos, sin dependencias de framework | `Story`, `Author`, `Storylist`, `Resource` (`@models/*`)                        |
| **Casos de uso / lógica**   | Reglas de aplicación: leer, mapear, coordinar                    | `getStoryBySlug`, `getStories`, `getAuthorBySlug` (services)                    |
| **Adaptadores de interfaz** | Traducen datos entre la lógica y los formatos externos           | Controllers Hono, **mappers / ACL** (`src/api/_utils/`), API services del front |
| **Frameworks y drivers**    | Detalles externos                                                | Sanity/GROQ, Hono, `@sanity/client`, Angular, el navegador                      |

### Principios de independencia

- **Independencia del framework** — Hono, Angular y Sanity son herramientas, no restricciones que dicten el modelo de dominio.
- **Independencia de la UI** — los componentes Angular signals-first pueden cambiar sin tocar las reglas de negocio.
- **Independencia de la persistencia** — el dominio no está atado a Sanity; cambiar de CMS afectaría solo a repositories y mappers.
- **Independencia de agencias externas** — el dominio no sabe nada del mundo exterior (Clarity, OG, etc.).

### Testabilidad por diseño

- Las reglas de negocio se testean sin UI, sin Sanity y sin servidor web.
- Los tipos de dominio son objetos planos sin dependencias de framework.
- Los services se testean sustituyendo el repository por un doble en memoria (`InMemory*`, ver más abajo): ver los `*.service.spec.ts` existentes (`content.service.spec.ts`, `sitemap.service.spec.ts`).

### Cruce de fronteras

- Definir fronteras claras entre componentes con distintas tasas de cambio (la query GROQ cambia más seguido que el tipo de dominio).
- Cruzar fronteras vía **inversión de dependencias**: las capas internas definen la forma del dato; las externas se adaptan a ella.
- Lo que cruza la frontera hacia el frontend es siempre **modelo de dominio mapeado**, nunca el resultado crudo de Sanity.

---

## La regla de dependencia aplicada al backend

El backend es **Hono plano** (no OpenAPIHono). Cada módulo en `src/api/modules/<dominio>/` sigue **controller → service → repository**, con los **mappers (ACL)** traduciendo Sanity/GROQ al dominio.

```
HTTP → controller → service → repository → Sanity (GROQ)
                       │            │
                       │            └─ fetch*()   devuelve el resultado CRUDO de Sanity
                       └─ get*()    llama al repository y MAPEA al dominio vía la ACL (_utils)
```

- **Controller** (`<dominio>.controller.ts`): rutas Hono, validación con `zValidator('param'|'query', schema)`, delega en el service. No conoce GROQ.
- **Service** (`<dominio>.service.ts`): lógica de aplicación. `get*()` para lecturas; envuelve al repository y mapea al dominio.
- **Repository** (`<dominio>.repository.ts`): acceso a datos. `fetch*()` ejecuta `client.fetch(query, params)` (GROQ) y devuelve el shape **crudo**. El cliente se importa de `_helpers/sanity-connector`.
- **ACL / mappers** (`src/api/_utils/functions.ts` y `*.functions.ts` vecinos): funciones puras (`mapAuthor`, `mapAuthorTeaser`, `mapResources`, …) que traducen Sanity → dominio. Es el punto donde el shape externo **deja de propagarse hacia adentro**.

> Las queries GROQ viven en `src/api/_queries/`, los schemas Zod del módulo en `<dominio>.schema.ts`. Detalle completo del flujo: [`sanity-acl.md`](sanity-acl.md).

La dirección de las dependencias respeta la regla: el **service** (lógica) depende de la **abstracción** del repository, no del cliente de Sanity; el **dominio** no depende de nadie.

---

## La regla de dependencia aplicada al frontend

Angular **signals-first** (sin NgRx). Los componentes y servicios consumen **modelo de dominio**, nunca el shape de la API cruda. Los servicios de acceso a datos viven en `src/app/providers/` y exponen estado como signals; los componentes son `OnPush`, zoneless, con `@if`/`@for`.

- Los componentes no conocen URLs ni el shape de transporte: dependen de la abstracción del servicio de datos.
- Los valores derivados son `computed()` / `toSignal()`, nunca estado duplicado.

> Detalle: [`domain-model.md`](domain-model.md) (qué es el dominio compartido entre back y front).

---

## Qualified Implementation (convención de nombres)

La interfaz lleva el **nombre limpio** (la responsabilidad), y la **implementación** lleva un **prefijo de tecnología/propósito**. El doble de test es siempre `InMemory*` — **nunca `Mock*`**.

**Regla del prefijo `I`:** la interfaz **no** lleva prefijo `I` (no `IStoryRepository`). La única excepción es una **colisión** con una clase del mismo nombre que deba coexistir; recién ahí se admite `I` para desambiguar.

### Backend

| Rol                      | Interfaz (nombre limpio) | Implementación real           | Doble de test                 |
| ------------------------ | ------------------------ | ----------------------------- | ----------------------------- |
| Repository de stories    | `StoryRepository`        | `SanityStoryRepository`       | `InMemoryStoryRepository`     |
| Repository de autores    | `AuthorRepository`       | `SanityAuthorRepository`      | `InMemoryAuthorRepository`    |
| Repository de storylists | `StorylistRepository`    | `SanityStorylistRepository`   | `InMemoryStorylistRepository` |
| Service (impl. única)    | `StoryService`           | `StoryService` (mismo nombre) | `InMemoryStoryService`        |

- Prefijo **`Sanity*`** para implementaciones de repository respaldadas por Sanity/GROQ.
- Prefijo **`InMemory*`** para **todos** los dobles de test (jamás `Mock*`).
- Los services de implementación única **conservan el nombre de la interfaz** (sin prefijo, sin sufijo `Impl`).

> Nota sobre el estado actual: hoy los módulos backend exponen funciones (`getStoryBySlug`, `fetchStories`) más que clases con interfaz explícita. La convención de arriba rige al introducir abstracciones de repository/service o sus dobles de test, y es la dirección a la que tienden los `*.service.spec.ts`.

### Frontend

| Rol               | Interfaz + token (`InjectionToken`) | Implementación     | Doble de test          |
| ----------------- | ----------------------------------- | ------------------ | ---------------------- |
| API de stories    | `StoryApi`                          | `HttpStoryApi`     | `InMemoryStoryApi`     |
| API de autores    | `AuthorApi`                         | `HttpAuthorApi`    | `InMemoryAuthorApi`    |
| API de storylists | `StorylistApi`                      | `HttpStorylistApi` | `InMemoryStorylistApi` |

- Prefijo **`Http*`** para implementaciones de servicios de API basadas en HTTP.
- Los tokens son `InjectionToken` planos (sin `providedIn`/`factory`), cableados vía funciones `provideX()` (en migración — ver #1499).

**Resumen de reglas:**

- Interfaz sin prefijo `I` (salvo colisión con clase homónima).
- `Sanity*` para repositories sobre Sanity/GROQ; `Http*` para API services del front.
- `InMemory*` para todo doble de test — nunca `Mock*`.
- Servicio de implementación única → conserva el nombre de la interfaz.

---

## Guías prácticas

1. **Empezar por el caso de uso** (`get*` del service) — define la intención del sistema.
2. **Diferir decisiones** — el shape de Sanity y el de transporte HTTP se deciden en los bordes, no en el dominio.
3. **Arquitectura que grita** — la estructura de `src/api/modules/<dominio>/` revela el dominio (story, author, storylist), no el framework.
4. **Objetos humildes** — lo difícil de testear (cliente Sanity, HTTP) queda en wrappers mínimos (repository / API service).
5. **El borde es sucio** — controllers y mappers absorben el formato externo para que el dominio quede limpio.

_Basado en Robert C. Martin, "Clean Architecture" (2018), adaptado al stack de La Cuentoneta._

---

## Referencias relacionadas

- [`sanity-acl.md`](sanity-acl.md) — el ACL central: GROQ → repository → mapper → modelo de dominio.
- [`domain-model.md`](domain-model.md) — DDD estratégico: agregados e invariantes (Story / Author / Storylist).
- [`solid.md`](solid.md) — principios SOLID (la inversión de dependencias subyace a "Qualified Implementation").
- [`cupid.md`](cupid.md) — propiedades CUPID.
