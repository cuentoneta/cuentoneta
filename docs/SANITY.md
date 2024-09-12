<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

# Tipado automático de consultas de Sanity (GROQ)

Para generar los tipos de las consultas de Sanity debemos seguir [esta guía](https://www.sanity.io/learn/course/typescripted-content/generating-type-for-groq-query-results). Solo en caso de que agreguemos nuevas entidades o se agreguen modificaciones en los schemas de entidades existentes necesitaremos actualizar el archivo `schema.json`. En este proyecto este archivo se encuentra en el directorio `cms/schema.json`.

De acuerdo a lo definido en `cms/sanity-typegen.json` los tipos generados mediante `sanity typegen generate` pueden encontrarse en `src/api/sanity/types.ts`, con los tipos generados para campos en la parte superior, sucedidos luego por los tipos generados para las queries de GROQ. Este archivo oficia como interfaz entre las consultas de Sanity y el código de los servicios de backend que disparan consultas mediante el conector a Sanity.

## Tipos generados y tipos derivados

Debido a las limitaciones del generador automático de tipos para reconocer el tipado de elementos dentro de atributos de tipo ´array´, desde las definiciones generadas por Typegen en `types.ts` se generan, de forma manual, tipos específicos para cada consulta y subtipos que se repiten en diversas consultas. Estas definiciones se agrupan en los archivos `derivate-types.ts`, `generated-query-types.ts`, y `generated-schema-types.ts`. Es decir que los tipos generados en el archivo `types.ts` _no deben_ ser utilizados directamente, sino que deben ser adaptados para su uso en los archivos de tipos generados. El archivo `types.ts` sólo se utiliza de manera temporal en el ambiente local, estando excluido del control de versiones, por lo cual es parte de las definiciones del archivo `.gitignore`.

Se pueden ver ejemplos de consultas definidas con tipos generados en `src/api/_queries`. En `src/api/author/author.service.ts` o `src/api/story/stoy.service.ts` se pueden ver ejemplos de cómo utilizar estos mismos tipos, para referencia del equipo de desarrollo.

> ⚠️Importante: No olvidar usar `defineQuery` antes de cada consulta para que la misma sea detectada por la herramienta de tipado automático de Sanity.

## Modificación de tipos de consultas existentes

Para obtener los nuevos tipos de una consulta de GROQ ya existente, mediante una ejecución de `sanity typegen generate` por haber sido esta modificada, es necesario eliminar temporalmente el decorador `//@sanity-typegen-ignore`, el cual es usado para evitar que la herramienta de tipado automático de Sanity genere tipos para una consulta en particular. Luego de eliminar el decorador, ejecutar `sanity typegen generate` y volver a agregar el decorador.

Si se genera una consulta nueva en un archivo `*.query.ts` es necesario agregar este decorador, luego de la corrida de Sanity Typegen, para evitar que la herramienta de tipado automático de Sanity genere tipos para esa consulta en particular a futuro.

## Valores nulos

Debe tenerse en cuenta que los tipos generados pueden incluir casos donde los campos serán nulos o no definidos. Por ejemplo `slug?: string | null`. Hasta ahora recurrimos a la correción manual en casos donde tenemos completa seguridad de que el valor siempre estará definido (ni `null` ni `undefined`), buscando evitar estos casos mediante la especificación de la regla de validación `required` en los schemas de Sanity.

Las queries de GROQ pueden ser nulas en caso de que no se encuentre el documento en la base de datos, lo cual debe ser validado mediante una cláusula `if` en el código de la aplicación a nivel del servicio que dispara la consulta. Pueden observarse ejemplos de esto en los servicios de `author` y `story`, en consultas que devuelven un valor único en base a una búsqueda por `slug`. En el caso de que las consultas devuelvan un array, el array será vacío -- lo cual es un comportamiento esperado y no debe ser tratado como un error o problema.

Para aquellos casos en los que los campos sean de tipo array debe hacerse uso de la función `coalesce` en las consultas GROQ para evitar que el campo sea `null` y devolver, en cambio, un array vacío que pueda ser tipado mediante `Array<never>`. Puede observarse un ejemplo en la consulta `src/api/author/author.query.ts`.
