## Tipado automático de consultas de Sanity

Para generar los tipos de las consultas de Sanity debemos seguir [esta guía](https://www.sanity.io/learn/course/typescripted-content/generating-type-for-groq-query-results). El link lleva directamente al paso 5 que explica cómo generar los tipos para una query GROQ. Los pasos anteriores son de configuración y no son necesarios para el ya que ya fueron completados (el `schema.json` puede encontrarse en `cms/schema.json`, por ejemplo). Solo en caso de que agreguemos nuevas entidades o se agreguen modificaciones en los schemas de entidades existentes necesitaremos actualizarlo.

De acuerdo a lo definido en `cms/sanity-typegen.json` los tipos generados mediante `sanity typegen generate` pueden encontrarse en `src/api/sanity/types.ts`, con los tipos generados para campos en la parte superior, sucedidos luego por los tipos generados para las queries de GROQ. Este archivo oficia como interfaz entre las consultas de Sanity y el código de los servicios de backend que disparan consultas mediante el conector a Sanity.

Desde las definiciones generadas por Typegen en `types.ts` se general, de forma manual, tipos específicos para cada consulta, como así también subtipos que se repiten en diversas consultas. Estas definiciones se agrupan en los archivos `derivate-types.ts`, `generated-query-types.ts`, y `generated-schema-types.ts`. Es decir que los tipos generados en el archivo `types.ts` _no deben_ ser utilizados directamente, sino que deben ser adaptados para su uso en los archivos de tipos generados. El archivo `types.ts` sólo se utiliza de manera temporal en el ambiente local, estando excluido del control de versiones.

Se pueden ver ejemplos de consultas definidas con tipos generados en `src/api/_queries`. En `src/api/author/author.service.ts` o `src/api/story/stoy.service.ts` se pueden ver ejemplos de cómo utilizarlos.

> ⚠️Importante: No olvidar usar `defineQuery` antes de cada consulta para que la misma sea detectada por la herramienta de tipado automático de Sanity.

Para obtener los nuevos tipos de una consulta de GROQ ya existente, por haber sido esta modificada, es necesario eliminar temporalmente el decorador `//@sanity-typegen-ignore`, el cual es usado para evitar que la herramienta de tipado automático de Sanity genere tipos para una consulta en particular. Luego de eliminar el decorador, ejecutar `sanity typegen generate` y volver a agregar el decorador.

Si se genera una consulta nueva en un archivo `*.query.ts` es necesario agregar este decorador, luego de la corrida de Sanity Typegen, para evitar que la herramienta de tipado automático de Sanity genere tipos para esa consulta en particular a futuro.

## Valores nulos

Tener en cuenta que los tipos generados pueden incluir casos donde los campos serán nulos o no definidos. Por ejemplo `slug?: string | null`. Hasta ahora recurrimos a la correción manual en casos donde tenemos completa seguridad de que el valor siempre estará definido (ni `null` ni `undefined`). Resta determinar si es posible ajustar las configuraciones o consultas del proyecto para evitar esto.

Para casos en los que los campos sean de tipo array debe hacerse uso de la función `coalesce` en las consultas GROQ para evitar que el campo sea `null` y devolver, en cambio, un array vacìo. Puede observarse un ejemplo en la consulta `src/api/author/author.query.ts`.
