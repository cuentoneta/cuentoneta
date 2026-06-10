<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Área de QA

Esta carpeta contiene la documentación de **aseguramiento de calidad (QA)** de La Cuentoneta: la guía para escribir test plans, las plantillas y un ejemplo práctico.

En La Cuentoneta un test plan tiene un **doble propósito**: documenta las pruebas de QA **y** funciona como la **especificación que dirige el desarrollo de los tests automatizados** (unitarios, de integración y de regresión).

## Documentos

| Documento                                          | Para qué sirve                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`TESTPLAN_GUIDE.md`](./TESTPLAN_GUIDE.md)         | **Empezá acá.** Cómo escribir un test plan: niveles, granularidad, trazabilidad. |
| [`TEST_PLAN_TEMPLATE.md`](./TEST_PLAN_TEMPLATE.md) | Plantilla para crear un test plan nuevo.                                         |
| [`TEST_CASE_TEMPLATE.md`](./TEST_CASE_TEMPLATE.md) | Plantilla para los casos de prueba (`TC-NNN`).                                   |
| [`TEST_PLAN.md`](./TEST_PLAN.md)                   | Ejemplo práctico: el plan de regresión del sitio.                                |

## Glosario

Conviene fijar la terminología para evitar ambigüedades:

| Término              | Definición                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Test plan**        | Documento de **alcance, estrategia, criterios y casos** para verificar una feature o el sistema. Tipo A o B (ver abajo). |
| **Caso de prueba**   | Una verificación concreta, identificada como `TC-NNN`, con su `Nivel` y su test asociado.                                |
| **Suite**            | El conjunto de tests **automatizados** (código en `*.spec.ts` y `e2e/`).                                                 |
| **Nivel**            | Cómo se verifica un caso: `unit` \| `integration` \| `e2e` \| `manual`.                                                  |
| **Test plan tipo A** | Por **feature / issue**: valida una funcionalidad puntual.                                                               |
| **Test plan tipo B** | De **regresión por release / milestone**: barrido de toda la plataforma antes de un lanzamiento.                         |

## Flujo en una línea

```
requisito / criterio de aceptación  →  caso de prueba (TC-NNN, con Nivel)  →  test automatizado (archivo + nombre)
```

Los casos sin test asociado son la **cobertura faltante**: la lista de trabajo para completar la suite automatizada.

## Relacionados

- Tablero de estado de QA — issue #1353.
- Migración de Jest a Vitest — issue #1494.
- Tests de integración pendientes — issues #948, #951, #1426.
