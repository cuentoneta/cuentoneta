<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Plantilla de Casos de Prueba

Un **caso de prueba** define una verificación concreta: qué se prueba, bajo qué condiciones, los pasos, el resultado esperado y obtenido, y su estado. Es la unidad que hace que el software se verifique de forma completa, trazable y repetible.

Cada caso lleva, además, dos campos propios de este proyecto (ver [`TESTPLAN_GUIDE.md`](./TESTPLAN_GUIDE.md)):

- **Nivel** — cómo se verifica: `unit` | `integration` | `e2e` | `manual`.
- **Test(s) asociado(s)** — la ruta y el nombre del test automatizado que cubre el caso, o `pendiente de automatizar`.

> Copiá el bloque `TC-NNN` tantas veces como casos necesites, con IDs correlativos.

---

## Caso de prueba: TC-001

**Módulo:**<br>
**Nombre del caso:**

### Nivel

- [ ] `unit`
- [ ] `integration`
- [ ] `e2e`
- [ ] `manual`

### Objetivo

Descripción breve de lo que se busca verificar.

### Precondiciones

- [ ] (Ejemplo 1)
- [ ] (Ejemplo 2)

### Pasos a seguir

1.
2.
3.

### Datos de prueba

- Links, credenciales
- Otros datos

### Resultado esperado

¿Qué debería ocurrir según los requerimientos?

### Resultado obtenido

Comportamiento observado durante la ejecución. _(No completar hasta ejecutar la prueba.)_

### Test(s) asociado(s)

- `ruta/al/archivo.spec.ts > "nombre del test"` — o `pendiente de automatizar`.

### Estado

- [ ] **Pass**
- [ ] **Fail**
- [ ] **Blocked**

### Severidad

- [ ] Alta
- [ ] Media
- [ ] Baja

### Prioridad

- [ ] Alta
- [ ] Media
- [ ] Baja

### Observaciones / Evidencia

- (Capturas, comentarios, referencias a errores, etc.)

---

## Caso de prueba: TC-002

**Módulo:**<br>
**Nombre del caso:**

### Nivel

- [ ] `unit`
- [ ] `integration`
- [ ] `e2e`
- [ ] `manual`

### Objetivo

Descripción breve de lo que se busca verificar.

### Precondiciones

- [ ] (Ejemplo 1)
- [ ] (Ejemplo 2)

### Pasos a seguir

1.
2.
3.

### Datos de prueba

- Links, credenciales
- Otros datos

### Resultado esperado

¿Qué debería ocurrir según los requerimientos?

### Resultado obtenido

Comportamiento observado durante la ejecución. _(No completar hasta ejecutar la prueba.)_

### Test(s) asociado(s)

- `ruta/al/archivo.spec.ts > "nombre del test"` — o `pendiente de automatizar`.

### Estado

- [ ] **Pass**
- [ ] **Fail**
- [ ] **Blocked**

### Severidad

- [ ] Alta
- [ ] Media
- [ ] Baja

### Prioridad

- [ ] Alta
- [ ] Media
- [ ] Baja

### Observaciones / Evidencia

- (Capturas, comentarios, referencias a errores, etc.)
