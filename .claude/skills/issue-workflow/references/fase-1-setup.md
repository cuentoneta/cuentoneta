## Fase 1 — Setup

**Propósito:** crear una rama de feature limpia desde `<rama-base>` actualizada (default `develop`, ver Fase 0 → "Base de la rama") — en el entorno resuelto por la Fase 0 (worktree o raíz).

1. Usar el número y el título ya recolectados en la Fase 0 → "Datos del issue" (no re-fetchear).
2. Derivar el nombre de rama (convención del repo):
   - Formato: **`feat/<number>-<titulo-en-kebab-case>`**.
   - Transformación: minúsculas, espacios y no-alfanuméricos → guiones, colapsar guiones consecutivos, recortar guiones de borde, truncar a ~60 caracteres en un límite de palabra.
3. **Modo raíz**:
   - **Precondición — working tree limpio:** `git status --short`. Si el árbol no está limpio, no hacer checkout: pausar con `AskUserQuestion` (`header`: `Working tree`; `question` que enumere los archivos sucios; opciones —recomendada primero— **Detener** —el usuario commitea/stashea/descarta y reinvoca— / **Stashear y seguir** —`git stash` y continuar—; "Other" cubre instrucciones libres). Solo aplica en modo raíz: en modo worktree, `git worktree add … <base>` crea un checkout nuevo sin tocar el árbol principal.
   - `git checkout <rama-base> && git pull` para asegurar la base actualizada.
   - `git checkout -b feat/<number>-<kebab>`. Si la Fase 0 detectó la rama existente y el usuario eligió **rehacer**, confirmar la reutilización y usar `git checkout feat/<number>-<kebab>` (sin `-b`).
4. **Modo worktree:** seguir [Modo worktree](modo-worktree.md) → "Mecánica de creación" (`git fetch origin`, `git worktree add`, `EnterWorktree`, `pnpm install` + `pnpm run config`).
5. Reportar al usuario: número, título, **milestone**, **parent epic** (o "sin epic"), nombre de rama, la **base** cuando `<rama-base> ≠ develop` (checkout apilado) y, en modo worktree, la ruta del worktree.
