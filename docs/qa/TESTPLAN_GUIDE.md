<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Guía de Testing

¡Te damos la bienvenida! En esta guía vas a encontrar cómo escribir un **test plan** en La Cuentoneta: qué es, cuándo se escribe, cómo se estructura y —algo propio de este proyecto— cómo el test plan funciona además como **especificación que dirige el desarrollo de los tests automatizados** (unitarios, de integración y de regresión).

La guía está pensada para dos audiencias:

- **Personas** (colaboradores de QA y desarrolladores) que escriben o ejecutan test plans.
- **Agentes de Claude Code** que asisten en la redacción de test plans (ver [§10](#10-asistencia-con-agentes-de-claude-code)).

Por eso la guía y sus plantillas usan una **estructura determinística** (encabezados fijos, IDs, campos obligatorios y valores acotados), de modo que tanto una persona como un agente puedan producir documentos consistentes.

Si querés sugerir mejoras a este documento, podés hacerlo en el canal **#🚐 | la-cuentoneta** en Discord o abriendo un issue del tipo **[💼 gestión / proceso](https://github.com/cuentoneta/cuentoneta/issues/new/choose)**.

## Índice

1. [¿Qué es un Test Plan?](#1-qué-es-un-test-plan)
2. [Propósito](#2-propósito)
3. [Niveles de prueba](#3-niveles-de-prueba)
4. [Granularidad: cuándo se escribe un test plan](#4-granularidad-cuándo-se-escribe-un-test-plan)
5. [Estructura de un Test Plan](#5-estructura-de-un-test-plan)
6. [Cómo escribir casos de prueba](#6-cómo-escribir-casos-de-prueba)
7. [Trazabilidad: caso ↔ test](#7-trazabilidad-caso--test)
8. [Regresión](#8-regresión)
9. [Estrategias para un buen Test Plan](#9-estrategias-para-un-buen-test-plan)
10. [Asistencia con agentes de Claude Code](#10-asistencia-con-agentes-de-claude-code)
11. [Herramientas del proyecto](#11-herramientas-del-proyecto)

---

# 1. ¿Qué es un Test Plan?

Un **test plan** (plan de pruebas) es un documento que describe el **alcance, la estrategia, los criterios de aceptación y los casos de prueba** para verificar una funcionalidad o el sistema completo.

En La Cuentoneta el test plan cumple un doble rol:

1. **Documento de QA**: guía la ejecución de pruebas (manuales y automatizadas) y deja un registro trazable y repetible.
2. **Especificación de tests**: cada caso de prueba es la fuente de la que se derivan los tests automatizados (unitarios, de integración y de regresión). Escribir el plan primero hace explícito _qué_ hay que verificar, antes de decidir _cómo_ automatizarlo.

> **Terminología.** No confundas **test plan** (el documento de alcance/estrategia/casos) con **caso de prueba** (cada verificación concreta, `TC-NNN`) ni con la **suite** de tests automatizados (el código en `*.spec.ts` / `e2e/`). Ver el glosario en [`README.md`](./README.md).

# 2. Propósito

El objetivo general es **garantizar la calidad** y que la plataforma cumpla con sus requisitos (funcionalidades, rendimiento, experiencia de usuario).

### 2.1 Propósitos específicos

- Definir el alcance y los objetivos de las pruebas.
- Establecer criterios de entrada y de salida (aceptación).
- Estructurar un enfoque claro y repetible.
- Identificar recursos y responsables.
- Prever riesgos y proponer estrategias.
- Promover la comunicación entre QA y desarrollo.

### 2.2 El test plan como especificación de tests

En este proyecto, además, el test plan **dirige el desarrollo de los tests automatizados**. La cadena es:

```
requisito / criterio de aceptación  →  caso de prueba (TC-NNN, con Nivel)  →  test automatizado (archivo + nombre)
```

Esto nos permite, entre otras cosas, **detectar la cobertura faltante** (casos sin test asociado) y **completar los tests de integración**, hoy ausentes en el proyecto.

# 3. Niveles de prueba

Cada **caso de prueba** declara un **Nivel**, que indica cómo se verifica. Los valores posibles son un conjunto cerrado:

| Nivel         | Qué verifica                                                                  | Dónde vive el test                        | Herramienta |
| ------------- | ----------------------------------------------------------------------------- | ----------------------------------------- | ----------- |
| `unit`        | Lógica aislada: funciones puras, mappers, value objects, lógica de componente | `src/**/*.spec.ts`                        | Vitest      |
| `integration` | Colaboración entre piezas: `service` ↔ `repository` ↔ Sanity/API, contratos   | `src/api/**` / specs de integración       | Vitest      |
| `e2e`         | Flujo de usuario completo en el navegador (navegación, lectura, etc.)         | `e2e/**`                                  | Playwright  |
| `manual`      | Lo que no se automatiza (criterio visual, exploratorio, compatibilidad)       | Checklist en el test plan / tablero de QA | Manual      |

**Heurística para asignar el nivel:**

- ¿Es lógica pura o de una sola unidad (un mapper, un value object, un `computed`)? → `unit`.
- ¿Cruza una frontera (un `service` que llama a un `repository` que consulta Sanity, o un contrato de API)? → `integration`.
- ¿Es un recorrido del usuario de punta a punta? → `e2e`.
- ¿No es razonable automatizarlo (revisión visual, navegadores/dispositivos, exploratorio)? → `manual`.

# 4. Granularidad: cuándo se escribe un test plan

En La Cuentoneta usamos **dos niveles de test plan, de forma complementaria**:

### A. Test plan por feature / issue

Cuando se desarrolla una funcionalidad nueva o un cambio relevante, el issue lleva su **test plan acotado**: los casos que validan _esa_ funcionalidad. Sirve de especificación para los tests de esa feature y se enlaza desde el issue/PR.

### B. Test plan de regresión por release / milestone

Existe un **plan de regresión vivo** a nivel de toda la plataforma (ver el ejemplo en [`TEST_PLAN.md`](./TEST_PLAN.md)), que se ejecuta/actualiza antes de cada lanzamiento (milestone). Los casos estables de los planes por feature (A) se **promueven** a este plan de regresión (B) para que pasen a formar parte del barrido previo a cada release.

> **Regla práctica:** una feature nueva nace con un plan tipo A; sus casos automatizados y estables migran al plan de regresión tipo B.

# 5. Estructura de un Test Plan

Usá la plantilla [`TEST_PLAN_TEMPLATE.md`](./TEST_PLAN_TEMPLATE.md). Un test plan incluye:

- **Introducción / objetivo:** qué funcionalidad o sistema se prueba y para qué.
- **Alcance:** qué se prueba y, explícitamente, **qué no** se prueba.
- **Estrategia:** niveles involucrados (ver [§3](#3-niveles-de-prueba)) y herramientas.
- **Criterios de aceptación:** condiciones que deben cumplirse.
- **Casos de prueba:** la lista de `TC-NNN` (ver [§6](#6-cómo-escribir-casos-de-prueba)).
- **Riesgos.**
- **Recursos y responsables:** roles (QA Manual, QA Automation, dev).
- **Cronograma / criterios de evaluación** (cuándo inician y finalizan las pruebas).

# 6. Cómo escribir casos de prueba

Usá la plantilla [`TEST_CASE_TEMPLATE.md`](./TEST_CASE_TEMPLATE.md). Cada caso es un bloque `TC-NNN` con, al menos:

- **Módulo** y **nombre del caso**.
- **Nivel** (`unit` | `integration` | `e2e` | `manual`) — ver [§3](#3-niveles-de-prueba).
- **Objetivo.**
- **Precondiciones** y **datos de prueba**.
- **Pasos a seguir.**
- **Resultado esperado** (no completar el "obtenido" hasta ejecutar).
- **Estado** (`Pass` / `Fail` / `Blocked`), **Severidad** y **Prioridad**.
- **Test(s) asociado(s):** ver [§7](#7-trazabilidad-caso--test).

Buenas prácticas: un caso verifica **una** cosa; el objetivo y los pasos deben ser reproducibles por otra persona sin contexto adicional.

# 7. Trazabilidad: caso ↔ test

Cada caso declara su(s) **Test(s) asociado(s)**: la ruta del archivo y el nombre del test que lo cubre. Formato:

```
src/app/.../story.mapper.spec.ts > "maps a Sanity story to the domain model"
e2e/navigation.spec.ts > "navigates from home to a story"
```

Si el caso todavía **no está automatizado**, se marca `pendiente de automatizar` (o `manual` si no corresponde automatizarlo). Esto convierte al test plan en un **mapa de cobertura auditable**: los casos sin test asociado son la lista de trabajo para completar la suite (en particular, los tests de integración faltantes).

# 8. Regresión

La regresión en La Cuentoneta es **mixta**:

- **Automatizada:** la suite que corre en CI en cada PR/release — tests `unit` e `integration` (Vitest) y `e2e` (Playwright).
- **Manual:** un **checklist** de los casos `manual` (revisión visual, compatibilidad de navegadores/dispositivos, exploratorio) que se ejecuta antes de cada lanzamiento.

El plan de regresión (tipo B, [§4](#4-granularidad-cuándo-se-escribe-un-test-plan)) consolida ambos: enlaza a los tests automatizados y lista el checklist manual.

# 9. Estrategias para un buen Test Plan

### 9.1 Entender los requisitos

Analizá el issue, sus criterios de aceptación y cualquier diseño/wireframe asociado. Priorizá las **funcionalidades críticas** (lectura y navegación de cuentos).

### 9.2 Definir el alcance

Respondé explícitamente: ¿qué se prueba? ¿qué **no** se prueba?

### 9.3 Elegir el enfoque

Identificá los niveles necesarios ([§3](#3-niveles-de-prueba)) y las herramientas. Preferí automatizar lo repetitivo y dejar `manual` solo lo que lo amerite.

### 9.4 Riesgos, roles y cronograma

Anticipá problemas (datos de prueba, entornos), clarificá responsables y definí cuándo inician y terminan las pruebas.

# 10. Asistencia con agentes de Claude Code

Esta documentación está escrita para que un agente de Claude Code pueda **asistir en la redacción de un test plan**. Cuando un agente reciba el pedido de escribir o completar un test plan, debe:

1. **Leer el issue/feature** y extraer sus **criterios de aceptación** y requisitos.
2. **Preguntar lo ambiguo** antes de redactar: alcance (qué se prueba / qué no), datos y credenciales de prueba, entorno objetivo, y si el plan es tipo A (feature) o B (regresión) — ver [§4](#4-granularidad-cuándo-se-escribe-un-test-plan).
3. **Derivar un caso `TC-NNN` por cada criterio de aceptación** o comportamiento verificable, usando [`TEST_CASE_TEMPLATE.md`](./TEST_CASE_TEMPLATE.md).
4. **Asignar el `Nivel`** de cada caso con la heurística de [§3](#3-niveles-de-prueba) (valor del conjunto cerrado `unit|integration|e2e|manual`).
5. **Enlazar la trazabilidad** ([§7](#7-trazabilidad-caso--test)): si el test ya existe, referenciar `archivo > "nombre"`; si no, marcar `pendiente de automatizar`.
6. **Respetar la estructura determinística**: encabezados fijos de las plantillas, IDs correlativos `TC-001`, `TC-002`…, y los valores acotados de `Nivel`/`Estado`/`Severidad`/`Prioridad`.
7. **No inventar resultados**: dejar "Resultado obtenido" vacío hasta que las pruebas se ejecuten.
8. **Señalar la cobertura faltante**: listar los casos sin test asociado como candidatos a automatizar.

> Esta guía está pensada para exponerse también como archivo de referencia de Claude (`.claude/references/`) y/o alimentar un subagente asistente de QA. Ese cableado se aborda en la iniciativa de adopción de flujos de Claude (epic #1498).

# 11. Herramientas del proyecto

| Herramienta                                                          | Uso                                       |
| -------------------------------------------------------------------- | ----------------------------------------- |
| **[Vitest](https://vitest.dev/)**                                    | Tests unitarios y de integración          |
| **[Playwright](https://playwright.dev/)**                            | Tests e2e                                 |
| **[Bruno](https://www.usebruno.com/)**                               | Pruebas de la API (`docs/api/`)           |
| **[GitHub Issues](https://github.com/cuentoneta/cuentoneta/issues)** | Tracking de bugs y casos                  |
| **GitHub Projects**                                                  | Tablero de estado de QA (ver issue #1353) |

> **Nota sobre el runner:** el proyecto está migrando de Jest a **Vitest** (issue #1494). Mientras la migración no se complete, los tests unitarios corren en Jest; las convenciones de esta guía ya asumen Vitest como destino.

Para el flujo general de desarrollo, ver la [Guía de Desarrollo](../DEVELOPMENT_GUIDE.md).

---

## Nota

Los test plans varían según el proyecto: cada uno tiene sus objetivos, requisitos y desafíos. Aun así, mantener una **estructura estándar** asegura consistencia y evita pasar por alto aspectos clave.

## Documentos relacionados

- [`README.md`](./README.md) — índice y glosario del área de QA.
- [`TEST_PLAN_TEMPLATE.md`](./TEST_PLAN_TEMPLATE.md) — plantilla de test plan.
- [`TEST_CASE_TEMPLATE.md`](./TEST_CASE_TEMPLATE.md) — plantilla de casos de prueba.
- [`TEST_PLAN.md`](./TEST_PLAN.md) — ejemplo práctico (plan de regresión del sitio).
- [Guía de Desarrollo](../DEVELOPMENT_GUIDE.md).

## Fuentes

- <https://en.wikipedia.org/wiki/Test_plan>
- <https://www.guru99.com/es/test-planning.html>
- <https://www.softwaretestingbureau.com/crear-un-buenplan-de-pruebas/>
