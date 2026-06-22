<!-- Fuente: CLAUDE.md | Última actualización: 2026-06-15 -->

# Cruce de principios (Cross-Reference)

Varios cuerpos de principios refuerzan las mismas ideas centrales. Este archivo es la **matriz** que las relaciona: **SOLID** (diseño de clases), **CUPID** (propiedades de código), **Clean Architecture** (capas y regla de dependencia) y **DDD** (modelo de dominio). Usá el encuadre que mejor encaje con tu contexto — todos apuntan a lo mismo.

> Referencias relacionadas: [`solid.md`](solid.md) · [`cupid.md`](cupid.md) · [`guiding-principles.md`](guiding-principles.md) · [`clean-architecture.md`](clean-architecture.md) · [`domain-model.md`](domain-model.md)

---

## 1. Misma idea, distinto encuadre

Una misma idea central aparece bajo distintos nombres según hablemos de clases, de propiedades de código o de código general. Elegí el vocabulario que comunique mejor en cada caso.

| Idea central                             | Diseño de clases (SOLID) | Propiedades de código (CUPID) | Código general       |
| ---------------------------------------- | ------------------------ | ----------------------------- | -------------------- |
| **Un único foco**                        | SRP                      | Composable, Unix Philosophy   | Filosofía Unix       |
| **Depender de abstracciones**            | DIP                      | —                             | —                    |
| **No depender de lo que no se usa**      | ISP                      | Composable                    | —                    |
| **Extender sin modificar**               | OCP                      | —                             | —                    |
| **Cumplir las expectativas (sustituir)** | LSP                      | Predictable                   | —                    |
| **Seguir convenciones**                  | —                        | Idiomatic                     | Idiomático           |
| **Usar lenguaje de dominio**             | —                        | Domain-Based                  | Basado en el dominio |
| **Construir solo lo necesario**          | —                        | —                             | YAGNI                |
| **Preferir la simplicidad**              | —                        | —                             | KISS                 |

> En cuentoneta el sesgo es **signals-first sin NgRx** y **backend Hono plano**: la "composición" se expresa con servicios + signals/RxJS en el frontend y con `controller → service → repository` en el backend, no con abstracciones extra que no aportan valor (YAGNI/KISS).

---

## 2. SOLID ↔ CUPID

SOLID describe **cómo diseñar clases**; CUPID describe **qué propiedades** debería exhibir el código bueno. Se solapan, pero CUPID es más amplio (aplica a funciones, módulos y componentes, no solo a clases).

| Principio SOLID                     | Propiedad(es) CUPID que refuerza | Cómo se relacionan                                                                                      |
| ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **SRP** (responsabilidad única)     | Composable, Unix Philosophy      | Una sola razón para cambiar ⇒ piezas pequeñas que se componen ("hacer una cosa bien").                  |
| **OCP** (abierto/cerrado)           | Composable                       | Extender combinando piezas en vez de editar las existentes.                                             |
| **LSP** (sustitución de Liskov)     | Predictable                      | Una implementación que respeta el contrato es sustituible y se comporta como se espera.                 |
| **ISP** (segregación de interfaces) | Composable                       | Interfaces chicas y enfocadas ⇒ se combinan sin arrastrar dependencias inútiles.                        |
| **DIP** (inversión de dependencias) | Composable, Domain-Based         | Depender de abstracciones del dominio permite intercambiar implementaciones (p. ej. Sanity / InMemory). |

> CUPID añade dos propiedades sin equivalente directo en SOLID: **Idiomatic** (seguir las convenciones del lenguaje/framework — en cuentoneta: Angular zoneless + signals, `@if`/`@for`, `inject()`) y **Domain-Based** (modelar con el lenguaje del dominio — `Story`, `Author`, `Storylist`).

---

## 3. SOLID/CUPID ↔ Clean Architecture

Clean Architecture aporta la **dimensión estructural** que SOLID/CUPID no fijan por sí solos: la **regla de dependencia** (las dependencias apuntan hacia adentro, hacia el dominio) y las **capas**.

| Concepto                        | Encuadre en cuentoneta                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **DIP** + regla de dependencia  | El dominio (`Story`, `Author`, `Storylist`, `Resource`) no conoce a Sanity. Los detalles dependen del dominio, nunca al revés.                                                             |
| **Qualified Implementation**    | Una misma operación de dominio admite varias implementaciones (p. ej. Sanity vs. InMemory) detrás del mismo contrato.                                                                      |
| **Anti-Corruption Layer (ACL)** | El **patrón central** del repo: los **mappers** (`mapAuthor`, `mapResources`, …) traducen el shape crudo de GROQ al modelo de dominio. Lo crudo de Sanity **nunca** se filtra al frontend. |
| **SRP por capa** (backend)      | `controller → service → repository`: rutas/validación, lógica/mapeo de dominio, acceso a datos. Cada capa con una única razón para cambiar.                                                |
| **Composable** (frontend)       | Estado modelado con **servicios + signals + RxJS** (sin NgRx); derivados con `computed()`/`toSignal()`, no estado duplicado.                                                               |

```
GROQ query → repository.fetch*()  →  service.get*()  →  mapX(rawResult): DomainType  →  controller
            (resultado crudo Sanity)                    (mapper / ACL en _utils)
```

> Backend **Hono plano** (no OpenAPIHono): la regla de dependencia se respeta con la convención de capas, no con un framework de inversión adicional. Ver [`clean-architecture.md`](clean-architecture.md) y [`sanity-acl.md`](sanity-acl.md).

---

## 4. Clean Architecture ↔ DDD

Clean Architecture dice **dónde** vive cada cosa (capas); DDD dice **qué** vive en el centro (el modelo de dominio) y **cómo** se expresa.

| DDD                                | Cómo aterriza en cuentoneta                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Lenguaje ubicuo / Domain-Based** | Los tipos de dominio (`Story`, `Author`, `Storylist`, `Resource`) usan el vocabulario del negocio, en el código y en la documentación. |
| **Agregados e invariantes**        | El modelo de dominio concentra las invariantes; los mappers garantizan que solo entren shapes válidos del dominio.                     |
| **Anti-Corruption Layer**          | Frontera explícita entre el modelo de Sanity (externo) y el modelo de dominio (interno): los **mappers** del ACL.                      |
| **Bounded contexts**               | Cada módulo de `src/api/modules/<dominio>/` acota un contexto con su propio controller/service/repository/schema.                      |

> Detalle de DDD estratégico (agregados, invariantes, bounded contexts) en [`domain-model.md`](domain-model.md).

---

## 5. Resolución de tensiones

Cuando dos principios parecen empujar en direcciones opuestas, esta es la prioridad en cuentoneta:

1. **YAGNI / KISS ganan sobre la abstracción especulativa.** No introducir interfaces, capas o indirecciones "por si acaso". Sin NgRx ni OpenAPIHono hasta que un issue lo indique (ver #1530 / #1531 en `CLAUDE.md`).
2. **El ACL no es negociable.** Aunque "sea más simple" pasar el resultado crudo de GROQ, los mappers se mantienen: es la frontera de dominio del repo.
3. **Idiomatic gana sobre la preferencia personal.** Seguir las convenciones de Angular zoneless + signals y de Hono plano, aunque exista otra forma "válida".
4. **Predictable sobre clever.** Código sustituible y testeable (Angular Testing Library, comportamiento de usuario) antes que soluciones ingeniosas difíciles de razonar.

---

## 6. Cómo usar esta matriz

- Al **diseñar una clase/servicio** → encuadre **SOLID** (columna "Diseño de clases").
- Al **revisar un módulo/componente** → encuadre **CUPID** (¿es Composable, Predictable, Idiomatic, Domain-Based?).
- Al **ubicar lógica** (¿controller, service, repository, mapper?) → **Clean Architecture** + el ACL.
- Al **nombrar y modelar** → **DDD** (lenguaje ubicuo, tipos de dominio).

Las cuatro vistas describen el mismo código bueno desde ángulos distintos; ninguna sustituye a las otras.
