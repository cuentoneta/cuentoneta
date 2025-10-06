<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

# Gestión de colores de TailwindCSS

El proyecto importa solo los colores de Tailwind que realmente usa para optimizar el _bundle_ y evitar _warnings_ de deprecación.

## Colores disponibles

Actualmente: `zinc`, `blue`.

## Agregar un nuevo color

Para agregar un nuevo color al proyecto:

1. Edita `src/app/providers/theme.service.ts`.
2. Agrega el color al import:
   ```typescript
   import { zinc, blue, red } from 'tailwindcss/colors';
   ```
3. Agrega el color al registro:
   ```typescript
   const AVAILABLE_COLORS = {
   	zinc,
   	blue,
   	red, // ← nuevo
   } as const;
   ```

## Uso

```typescript
constructor(private themeService: ThemeService) {}

const color = this.themeService.pickColor('red', 500);
// Devuelve: '#EF4444'
```
