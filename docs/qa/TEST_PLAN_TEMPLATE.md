<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Plantilla de Test Plan

> Copiá esta plantilla para crear un test plan nuevo. Completá todas las secciones; si una no aplica, escribí explícitamente "No aplica" y por qué. Para la metodología, ver [`TESTPLAN_GUIDE.md`](./TESTPLAN_GUIDE.md).

**Título del plan:**
**Tipo:** `A (feature / issue)` | `B (regresión por release / milestone)`
**Issue / Milestone asociado:** #
**Autor/es:**
**Fecha:**

---

## 1. Objetivo

Breve descripción de la funcionalidad o sistema a probar y qué se busca verificar.

## 2. Alcance

### Se prueba

-

### No se prueba

-

## 3. Estrategia

- **Niveles involucrados:** `unit` / `integration` / `e2e` / `manual` (indicar cuáles y por qué).
- **Herramientas:** Vitest (unit/integration), Playwright (e2e), Bruno (API), manual.

## 4. Criterios de aceptación

- [ ]
- [ ]

## 5. Casos de prueba

> Un bloque `TC-NNN` por caso, usando [`TEST_CASE_TEMPLATE.md`](./TEST_CASE_TEMPLATE.md). Tabla resumen:

| ID     | Caso | Nivel                               | Prioridad       | Test asociado                   | Estado                           |
| ------ | ---- | ----------------------------------- | --------------- | ------------------------------- | -------------------------------- |
| TC-001 |      | `unit`/`integration`/`e2e`/`manual` | Alta/Media/Baja | `ruta > "nombre"` / _pendiente_ | Pass/Fail/Blocked/_sin ejecutar_ |

## 6. Riesgos

-

## 7. Recursos y responsables

| Rol           | Responsable |
| ------------- | ----------- |
| QA Manual     |             |
| QA Automation |             |
| Desarrollo    |             |

## 8. Cronograma y criterios de evaluación

- **Inicio de las pruebas:**
- **Fin de las pruebas / criterio de salida:**
- **Entregables:** (informe de resultados, bugs, cobertura faltante).
