# Flujo de resolución de issues (`/issue-workflow`)

Este documento describe, para lectura humana, cómo funciona el skill [`issue-workflow`](../.claude/skills/issue-workflow/SKILL.md): sus seis fases, en qué puntos se detiene a preguntar, qué artefactos deja y qué subagentes despierta en cada tramo.

La **especificación normativa** del flujo es el `SKILL.md` — es lo que el agente ejecuta. Este documento es su mapa: si alguno de los dos se desactualiza, manda el `SKILL.md`.

## Mapa del flujo

Los rombos son pausas con `AskUserQuestion`: el flujo no avanza sin respuesta del usuario. Los nodos con doble borde son subagentes; los que tienen forma de paralelogramo, los artefactos que quedan escritos en `workspace/<number>/`.

La Fase 3 cierra abriendo un **PR en borrador**, así que la integración continua corre mientras la Fase 4 revisa, en vez de después. Eso reparte los gates en dos tiers: la sesión corre localmente los baratos (`typecheck`, `lint`, `stylelint`, `test`, `check-agents`) y delega al borrador los lentos (`build`, `storybook`, `studio-build`, `e2e`). El borrador no convoca a nadie —no solicita reviewers ni notifica codeowners— y bloquea el merge; el evento que pide la review humana es `gh pr ready`, en la Fase 6.

```mermaid
flowchart TD
    START(["Invocación con la URL del issue"]) --> F0

    subgraph F0 ["Fase 0 · Detección de estado"]
        direction TB
        F0A["Entorno: worktree o raíz"] --> F0B["Datos del issue: número, título, body, milestone, labels, parent"]
        F0B --> F0C["Base de la rama: develop o apilada"]
        F0C --> F0D["Señales de reanudación: rama, PLAN, review, commits, PR"]
    end

    F0 --> Q0{"¿Hay trabajo previo?"}
    Q0 -->|"Sesión nueva"| F1
    Q0 -->|"Reanudar"| SALTO["Saltar a la fase sugerida"]
    Q0 -->|"Rehacer"| F1
    SALTO -.-> F2
    SALTO -.-> F3
    SALTO -.-> F4
    SALTO -.-> F5

    subgraph F1 ["Fase 1 · Setup"]
        direction TB
        F1A["Derivar rama feat/número-kebab"] --> F1B["Crear rama o worktree desde la base actualizada"]
    end

    F1 --> F2

    subgraph F2 ["Fase 2 · Plan"]
        direction TB
        F2A["Evaluar si el issue amerita asesoría"] --> F2B[["domain-model-advisor"]]
        F2A --> F2C[["architecture-advisor"]]
        F2B --> F2D[["plan-writer"]]
        F2C --> F2D
        F2A -->|"Cambio localizado"| F2D
        F2D --> F2E[/"workspace/número/PLAN.md"/]
    end

    F2 --> Q2{"Pausa: ¿se aprueba el plan?"}
    Q2 -->|"Dar feedback"| F2D
    Q2 -->|"Aprobar"| F3

    subgraph F3 ["Fase 3 · Implement"]
        direction TB
        F3A["Ejecutar los pasos del plan"] --> F3B["Verificación barata antes de cada commit: typecheck + vitest related"]
        F3B --> F3C["Commit atómico y marcado del paso en PLAN.md"]
        F3C --> F3A
        F3A --> F3D["Scan de impacto en documentación"]
        F3D --> F3E[["documentation-writer"]]
        F3D --> F3F["Push de la rama y PR en borrador"]
    end

    F3 --> F4

    subgraph F4 ["Fase 4 · Review"]
        direction TB
        F4A["Gates del tier local en paralelo"] --> F4G["Leer los checks del borrador, sin esperarlos"]
        F4G --> F4B["Evaluar si el diff toca superficie de seguridad"]
        F4B --> F4C[["code-reviewer"]]
        F4B --> F4D[["security-auditor"]]
        F4C --> F4E[/"workspace/número/CODE_REVIEW.md"/]
        F4D --> F4F[/"workspace/número/SECURITY_REVIEW.md"/]
    end

    F4 --> Q4{"Pausa: ¿hay Críticos sin disposición?"}
    Q4 -->|"Proceder"| F5
    Q4 -->|"Ship o Disponer y ship"| F6

    subgraph F5 ["Fase 5 · Fix"]
        direction TB
        F5A["Abordar Críticos y luego Advertencias"] --> F5B["Commit atómico por fix y actualización del Estado"]
        F5B --> F5C[["test-generator"]]
        F5B --> F5D["Re-correr los gates del tier local que el diff toca"]
        F5D --> F5E["Push de los fixes al borrador"]
    end

    F5 --> F6

    subgraph F6 ["Fase 6 · Ship"]
        direction TB
        F6A["Verificar que los diez checks del borrador estén verdes"] --> F6B["Completar el cuerpo y marcar listo (gh pr ready)"]
        F6B --> F6C["Escanear ítems fuera de alcance"]
        F6C --> F6D["Resumen final"]
    end

    F6 --> FIN(["El worktree se mantiene hasta que el PR mergee"])

    classDef agente fill:#1f2937,stroke:#60a5fa,stroke-width:2px,color:#e5e7eb
    classDef artefacto fill:#1f2937,stroke:#34d399,stroke-width:2px,color:#e5e7eb
    class F2B,F2C,F2D,F3E,F4C,F4D,F5C agente
    class F2E,F4E,F4F artefacto
```

## Los tres puntos de pausa

El flujo se detiene exactamente en tres lugares, siempre vía `AskUserQuestion`:

1. **Fase 0 — reanudación.** Solo si detecta trabajo previo sobre el issue (rama, plan, review o commits). Una sesión nueva no pausa acá.
2. **Fase 2 — aprobación del plan.** No se implementa nada sin un "Aprobar" explícito. El feedback se reenvía a la misma tarea del `plan-writer`, que reescribe el plan en el mismo archivo.
3. **Fase 4 — disposición de los hallazgos.** Si quedan hallazgos Críticos sin disposición, la opción de shipear directo no se ofrece.

Además hay pausas puntuales para acciones hacia afuera: crear un issue diferido (Fase 5) o los follow-ups fuera de alcance (Fase 6) requieren confirmación previa.

## Subagentes: qué despierta a cada uno

| Subagente              | Fase | Se despierta cuando…                                                                                            | Devuelve             |
| ---------------------- | ---- | --------------------------------------------------------------------------------------------------------------- | -------------------- |
| `domain-model-advisor` | 2    | el issue crea o modifica entidades de dominio, value objects, mappers del ACL, queries GROQ o tipos compartidos | texto al orquestador |
| `architecture-advisor` | 2    | el cambio es estructuralmente significativo — módulo, capa, bounded context o dirección de dependencias         | texto al orquestador |
| `plan-writer`          | 2    | siempre — recibe el aporte de los advisors que hayan corrido                                                    | `PLAN.md`            |
| `documentation-writer` | 3    | el cambio toca tipos, schemas de Sanity/Zod, contratos de API o terminología de dominio                         | archivos de doc      |
| `code-reviewer`        | 4    | siempre — recibe el resultado observado de los gates, locales y del borrador, para no re-correrlos              | `CODE_REVIEW.md`     |
| `security-auditor`     | 4    | el diff toca superficie de seguridad — ver la sección "Cuándo correr" de su propio agente                       | `SECURITY_REVIEW.md` |
| `test-generator`       | 5    | opcional, ante un hallazgo que sea un gap de cobertura                                                          | specs                |

Los dos advisors de la Fase 2 corren **antes** de planificar y en paralelo entre sí: su evaluación entra en el prompt del `plan-writer`, que no puede delegar por su cuenta. En la Fase 4, `code-reviewer` y `security-auditor` también corren en paralelo y escriben archivos distintos.

## Entornos: worktree o raíz

El flujo puede correr en un worktree propio bajo `.claude/worktrees/<number>` o en el working tree principal. La Fase 0 lo resuelve —por declaración explícita, por detección de un worktree previo, o preguntando— y esa decisión rige para toda la sesión, incluidos los subagentes delegados.

El worktree aísla la sesión de cualquier otra corriendo en paralelo, a cambio de un setup propio (`pnpm install` + `pnpm run config`). Se mantiene hasta que el PR mergee, para permitir reanudar; la limpieza se ofrece al reanudar un issue cuyo PR ya está mergeado.
