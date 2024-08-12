## Tipado automático de consultas de Sanity

Para generar los tipos de las consultas de Sanity debemos seguir [esta guía](https://www.sanity.io/learn/course/typescripted-content/generating-type-for-groq-query-results). El link lleva directamente al paso 5 que explica cómo generar los tipos para una query GROQ. Los pasos anteriores son de configuración y no son necesarios para el ya que ya fueron completados (el `schema.json` puede encontrarse en `cms/schema.json`, por ejemplo). Solo en caso de que agreguemos nuevas entidades necesitaremos actualizarlo.

De acuerdo a lo definido en `cms/sanity-typegen.json` los tipos generados mediante `sanity typegen generate` pueden encontrarse en `src/api/sanity/types.ts`, hacia el final del archivo.

Se pueden ver ejemplos de consultas definidas con tipos generados en `src/api/_queries`. En `src/api/author/author.service.ts` o `src/api/story/stoy.service.ts` se pueden ver ejemplos de cómo utilizarlos.

> ⚠️Importante: No olvidar usar `groq` antes de cada consulta para que la misma sea detectada por la herramienta de tipado automático de Sanity.

## Valores nulos

Tener en cuenta que los tipos generados van a incluir múltiples casos donde los campos serán potencialmente nulos o no definidos. Por ejemplo `slug?: string | null`. Hasta ahora recurrimos a la correción manual en casos donde tenemos completa seguridad de que el valor siempre estará definido (ni `null` ni `undefined`). Resta determinar si es posible ajustar las configuraciones o consultas del proyecto para evitar esto.
